import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export enum ProvisioningJobStatusDto {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class ProvisioningStatusDto {
  @ApiProperty({
    enum: ProvisioningJobStatusDto,
    description: 'Provisioning job status',
  })
  @IsEnum(ProvisioningJobStatusDto)
  status: ProvisioningJobStatusDto;

  @ApiPropertyOptional({
    description: 'Provisioned endpoints and related data',
    example: {
      rpcEndpoint: 'https://rpc.example.com',
      explorerUrl: 'https://explorer.example.com',
    },
  })
  @IsOptional()
  @IsObject()
  endpoints?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiPropertyOptional({ description: 'Completion timestamp (ISO8601)' })
  @IsOptional()
  @IsISO8601()
  completedAt?: string;
}
