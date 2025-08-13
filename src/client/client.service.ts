import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../../prisma/src/db.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class ClientService {
  constructor(private readonly db: DbService) {}

  private toUserResponse(user: {
    id: number;
    name: string | null;
    walletAddress: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.db.users.create({
      name: dto.name ?? null,
      walletAddress: dto.walletAddress ?? null,
    });
    return this.toUserResponse(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.db.users.findMany();
    return users.map((u) => this.toUserResponse(u));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.db.users.findUnique({ id });
    if (!user) throw new NotFoundException('User not found');
    return this.toUserResponse(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    // Ensure user exists to give 404 instead of Prisma error
    const existing = await this.db.users.findUnique({ id });
    if (!existing) throw new NotFoundException('User not found');
    const updated = await this.db.users.update(
      { id },
      {
        name: dto.name ?? existing.name,
        walletAddress: dto.walletAddress ?? existing.walletAddress,
      },
    );
    return this.toUserResponse(updated);
  }

  async remove(id: number): Promise<void> {
    // Ensure user exists
    const existing = await this.db.users.findUnique({ id });
    if (!existing) throw new NotFoundException('User not found');
    await this.db.users.delete({ id });
  }
}
