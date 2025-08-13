import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { NetworksService } from './networks.service';
import { CreateNetworkDto } from './dto/create-network.dto';
import { NetworkResponseDto } from './dto/network-response.dto';
import { ProvisioningStatusDto } from './dto/provisioning-status.dto';

@ApiTags('networks')
@Controller('networks')
export class NetworksController {
  constructor(private readonly networksService: NetworksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new network' })
  @ApiResponse({
    status: 201,
    description: 'The network has been successfully created.',
    type: NetworkResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiBody({ type: CreateNetworkDto })
  async createNetwork(
    @Body() createNetworkDto: CreateNetworkDto,
  ): Promise<NetworkResponseDto> {
    try {
      return await this.networksService.createNetwork(createNetworkDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create network',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all networks' })
  @ApiResponse({
    status: 200,
    description: 'Return all networks.',
    type: [NetworkResponseDto],
  })
  async getAllNetworks(): Promise<NetworkResponseDto[]> {
    return this.networksService.getAllNetworks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a network by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the network.',
    type: NetworkResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Network not found.' })
  async getNetworkById(@Param('id') id: string): Promise<NetworkResponseDto> {
    const network = await this.networksService.getNetworkById(+id);
    if (!network) {
      throw new HttpException('Network not found', HttpStatus.NOT_FOUND);
    }
    return network;
  }

  @Post(':id/provisioning-status')
  @ApiOperation({
    summary: 'Report provisioning status for a network (called by Provisioner)',
  })
  @ApiResponse({
    status: 200,
    description: 'Network status updated',
    type: NetworkResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Network not found.' })
  async updateProvisioningStatus(
    @Param('id') id: string,
    @Body() body: ProvisioningStatusDto,
  ): Promise<NetworkResponseDto> {
    try {
      const updated = await this.networksService.updateProvisioningStatus(
        +id,
        body,
      );
      return updated;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update provisioning status';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
