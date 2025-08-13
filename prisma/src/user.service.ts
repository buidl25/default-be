import type { Prisma, PrismaClient, User } from '@prisma/client';

/**
 * UserService provides typed CRUD helpers around Prisma's `user` model.
 * It is intended to be exposed via `DbService` as `db.users`.
 */
export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  /** Create a User */
  async create(data: Prisma.UserCreateArgs['data']): Promise<User> {
    return this.prisma.user.create({ data });
  }

  /** Get one by unique key */
  async findUnique(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({ where });
  }

  /** List users with optional filters */
  async findMany(args: Prisma.UserFindManyArgs = {}): Promise<User[]> {
    return this.prisma.user.findMany(args);
  }

  /** Update by unique key */
  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateArgs['data'],
  ): Promise<User> {
    return this.prisma.user.update({ where, data });
  }

  /** Delete by unique key */
  async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({ where });
  }
}
