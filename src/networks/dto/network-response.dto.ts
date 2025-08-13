import { ApiProperty } from '@nestjs/swagger';

class EndpointDto {
  @ApiProperty({
    description: 'RPC endpoint URL',
    example: 'https://rpc.example.com',
  })
  rpc: string;

  @ApiProperty({
    description: 'Explorer URL',
    example: 'https://explorer.example.com',
  })
  explorer?: string;
}

export class NetworkResponseDto {
  @ApiProperty({ description: 'Network ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Network name', example: 'My EVM Network' })
  name: string;

  @ApiProperty({
    description: 'Network status',
    example: 'pending',
    enum: ['pending', 'active', 'failed'],
  })
  status: string;

  @ApiProperty({ description: 'Network endpoints', type: EndpointDto })
  endpoints: EndpointDto | null;

  @ApiProperty({ description: 'Chain ID', example: 1337 })
  chainId: number | null;

  @ApiProperty({ description: 'Owner ID', example: 1 })
  ownerId: number;

  @ApiProperty({ description: 'Owner name', example: 'John Doe' })
  ownerName: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-08-12T16:53:10.123Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-08-12T16:53:10.123Z',
  })
  updatedAt: Date;
}
