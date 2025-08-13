import { Injectable } from '@nestjs/common';
import { DbService } from './db.service';

// Backwards-compatible alias so modules expecting PrismaService keep working
@Injectable()
export class PrismaService extends DbService {}
