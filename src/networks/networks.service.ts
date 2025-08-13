import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DbService } from '../../prisma/src/db.service';
import { CreateNetworkDto } from './dto/create-network.dto';
import { NetworkResponseDto } from './dto/network-response.dto';
import { NetworkEntity } from './dto/network-entity.dto';
import { ProvisioningService } from '../provisioning/provisioning.service';
import {
  ProvisioningStatusDto,
  ProvisioningJobStatusDto,
} from './dto/provisioning-status.dto';

@Injectable()
export class NetworksService {
  private readonly logger = new Logger(NetworksService.name);

  constructor(
    private dbService: DbService,
    private provisioningService: ProvisioningService,
  ) {}

  async createNetwork(
    createNetworkDto: CreateNetworkDto,
  ): Promise<NetworkResponseDto> {
    try {
      // Validate owner exists to avoid FK violation
      const owner = await this.dbService.users.findUnique({
        id: createNetworkDto.ownerId,
      });
      if (!owner) {
        throw new HttpException('Owner not found', HttpStatus.BAD_REQUEST);
      }

      // Create the network in the database
      const network = await this.dbService.networks.create({
        name: createNetworkDto.name,
        status: 'pending', // Initial status
        ownerId: createNetworkDto.ownerId,
        // Store endpoints as JSON if provided
        endpoints:
          (createNetworkDto.endpoints as unknown as Prisma.InputJsonValue) ??
          Prisma.JsonNull,
        chainId: createNetworkDto.chainId ?? null,
      });

      // Trigger the provisioning pipeline
      try {
        const provisioningConfig = {
          name: network.name,
          chainId: network.chainId,
          owner: {
            id: network.ownerId,
          },
        };

        const jobId = await this.provisioningService.triggerProvisioning(
          network.id,
          provisioningConfig,
        );

        this.logger.log(
          `Provisioning triggered for network ${network.id} with job ID: ${jobId}`,
        );

        // Update the network with the provisioning job ID
        await this.dbService.networks.update(
          { id: network.id },
          {
            endpoints: {
              provisioningJobId: jobId,
            } as unknown as Prisma.InputJsonValue,
          },
        );
      } catch (provisioningError) {
        this.logger.error(
          `Failed to trigger provisioning: ${provisioningError.message}`,
        );
        // We don't throw here to avoid failing the network creation
        // The network is created with 'pending' status, and provisioning can be retried later
      }

      return this.mapToNetworkResponseDto(network);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'P2002') {
        throw new HttpException(
          'Network with this name already exists',
          HttpStatus.CONFLICT,
        );
      }
      if (code === 'P2003') {
        // Foreign key constraint failed (e.g., invalid ownerId)
        throw new HttpException(
          'Invalid ownerId: owner user does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
      const message = err instanceof Error ? err.message : undefined;
      throw new HttpException(
        message || 'Failed to create network',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllNetworks(): Promise<NetworkResponseDto[]> {
    const networks = await this.dbService.networks.findMany();

    return networks.map((network) => this.mapToNetworkResponseDto(network));
  }

  async getNetworkById(id: number): Promise<NetworkResponseDto | null> {
    const network = await this.dbService.networks.findUnique({ id });

    if (!network) {
      return null;
    }

    return this.mapToNetworkResponseDto(network);
  }

  /**
   * Update provisioning status and endpoints for a network (called by Provisioner)
   */
  async updateProvisioningStatus(
    id: number,
    body: ProvisioningStatusDto,
  ): Promise<NetworkResponseDto> {
    const existing = await this.dbService.networks.findUnique({ id });
    if (!existing) {
      throw new HttpException('Network not found', HttpStatus.NOT_FOUND);
    }

    const updateData: Prisma.NetworkUpdateArgs['data'] = {
      status: this.mapProvisioningStatusToNetworkStatus(body.status),
    };
    if (typeof body.endpoints !== 'undefined') {
      updateData.endpoints = body.endpoints as unknown as Prisma.InputJsonValue;
    }

    const updated = await this.dbService.networks.update({ id }, updateData);
    return this.mapToNetworkResponseDto(updated);
  }

  // Map provisioner job status to Network.status values
  private mapProvisioningStatusToNetworkStatus(
    status: ProvisioningStatusDto['status'],
  ): string {
    switch (status) {
      case ProvisioningJobStatusDto.COMPLETED:
        return 'active';
      case ProvisioningJobStatusDto.FAILED:
        return 'failed';
      case ProvisioningJobStatusDto.IN_PROGRESS:
      case ProvisioningJobStatusDto.PENDING:
      default:
        return 'pending';
    }
  }

  // Helper method to map Prisma Network model to NetworkResponseDto
  private mapToNetworkResponseDto(network: NetworkEntity): NetworkResponseDto {
    return {
      id: network.id,
      name: network.name,
      status: network.status,
      endpoints: (network.endpoints ?? null) as NetworkResponseDto['endpoints'],
      chainId: network.chainId,
      ownerId: network.ownerId,
      ownerName: null,
      createdAt: network.createdAt,
      updatedAt: network.updatedAt,
    };
  }
}
