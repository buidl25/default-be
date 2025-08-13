import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Service responsible for communicating with the Provisioning Service
 * to trigger network provisioning and deployment
 */
@Injectable()
export class ProvisioningService {
  private readonly logger = new Logger(ProvisioningService.name);
  private readonly provisioningServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    // Get the provisioning service URL from environment variables
    this.provisioningServiceUrl = this.configService.get<string>(
      'PROVISIONING_SERVICE_URL',
      'http://localhost:3347', // Default URL for local development
    );
    console.log(
      '🚀 ~ ProvisioningService ~ constructor ~ his.provisioningServiceUrl:',
      this.provisioningServiceUrl,
    );
  }

  /**
   * Trigger the provisioning pipeline for a new network
   * @param networkId - ID of the network to provision
   * @param networkConfig - Configuration for the network
   * @returns The provisioning job ID
   */
  async triggerProvisioning(
    networkId: number,
    networkConfig: any,
  ): Promise<string> {
    try {
      this.logger.log(
        `Triggering provisioning for network ${networkId}`,
        'triggerProvisioning',
      );

      // Prepare the request payload
      const payload = {
        networkId,
        config: networkConfig,
        timestamp: new Date().toISOString(),
      };

      // Send the request to the provisioning service
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.provisioningServiceUrl}/api/provision`,
          payload,
        ),
      );

      const jobId = response.data.jobId;
      this.logger.log(
        `Provisioning job created with ID: ${jobId}`,
        'triggerProvisioning',
      );

      return jobId;
    } catch (error) {
      this.logger.error(
        `Failed to trigger provisioning for network ${networkId}: ${error.message}`,
        'triggerProvisioning',
      );
      throw new Error(`Failed to trigger provisioning: ${error.message}`);
    }
  }

  /**
   * Check the status of a provisioning job
   * @param jobId - ID of the provisioning job
   * @returns The current status of the job
   */
  async checkProvisioningStatus(jobId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.provisioningServiceUrl}/api/provision/${jobId}/status`,
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to check provisioning status for job ${jobId}: ${error.message}`,
        'checkProvisioningStatus',
      );
      throw new Error(`Failed to check provisioning status: ${error.message}`);
    }
  }
}
