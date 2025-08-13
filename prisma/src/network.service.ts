import type { Prisma, PrismaClient, Network } from '@prisma/client';

/**
 * NetworkService provides typed CRUD helpers around Prisma's `network` model.
 * It is intended to be exposed via `DbService` as `db.networks`.
 */
export class NetworkService {
  constructor(private readonly prisma: PrismaClient) {}

  /** Create a Network */
  async create(data: Prisma.NetworkCreateArgs['data']): Promise<Network> {
    return this.prisma.network.create({ data });
  }

  /** Get one by unique key */
  async findUnique(
    where: Prisma.NetworkWhereUniqueInput,
  ): Promise<Network | null> {
    return this.prisma.network.findUnique({ where });
  }

  /** List networks with optional filters */
  async findMany(args: Prisma.NetworkFindManyArgs = {}): Promise<Network[]> {
    return this.prisma.network.findMany(args);
  }

  /** Update by unique key */
  async update(
    where: Prisma.NetworkWhereUniqueInput,
    data: Prisma.NetworkUpdateArgs['data'],
  ): Promise<Network> {
    return this.prisma.network.update({ where, data });
  }

  /** Delete by unique key */
  async delete(where: Prisma.NetworkWhereUniqueInput): Promise<Network> {
    return this.prisma.network.delete({ where });
  }
}
