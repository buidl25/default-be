import { Prisma } from '@prisma/client';

// Internal DTO/type representing the persisted Network entity shape
// Mirrors the Prisma model `Network` fields used by NetworksService
export interface NetworkEntity {
  id: number;
  name: string;
  status: string;
  endpoints: Prisma.JsonValue | null;
  chainId: number | null;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}
