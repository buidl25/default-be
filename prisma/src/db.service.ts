import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DbService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DbService.name);

  constructor(private readonly configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');

    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    if (!databaseUrl) {
      this.logger.error('DATABASE_URL environment variable is not set');
    }
  }

  /**
   * Connect to the database when the module initializes
   * @returns {Promise<void>}
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the database');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to the database: ${message}`);
      throw error;
    }
  }

  /**
   * Get the Prisma client instance
   * @returns {PrismaClient}
   */
  getPrismaClient(): PrismaClient {
    return this;
  }

  /**
   * Disconnect from the database when the module is destroyed
   * @returns {Promise<void>}
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Disconnected from the database');
  }
}
