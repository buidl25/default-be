import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class EndpointDto {
  @ApiProperty({
    description: 'RPC endpoint URL',
    example: 'https://rpc.example.com',
  })
  @IsString()
  @IsNotEmpty()
  rpc: string;

  @ApiProperty({
    description: 'Explorer URL',
    example: 'https://explorer.example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  explorer?: string;
}

export class CreateNetworkDto {
  @ApiProperty({ description: 'Network name', example: 'My EVM Network' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Owner ID', example: 1 })
  @IsInt()
  ownerId: number;

  @ApiProperty({ description: 'Chain ID', example: 1337, required: false })
  @IsInt()
  @IsOptional()
  chainId?: number;

  @ApiProperty({
    description: 'Network endpoints',
    type: EndpointDto,
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => EndpointDto)
  @IsOptional()
  endpoints?: EndpointDto;
}
