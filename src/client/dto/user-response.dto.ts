import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty({ nullable: true, description: 'Wallet address' })
  walletAddress: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
