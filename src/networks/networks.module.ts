import { Module } from '@nestjs/common';
import { NetworksController } from './networks.controller';
import { NetworksService } from './networks.service';
import { DbModule } from '../../prisma/src/db.module';
import { ProvisioningModule } from 'src/provisioning/provisioning.module';

@Module({
  imports: [DbModule, ProvisioningModule],
  controllers: [NetworksController],
  providers: [NetworksService],
  exports: [NetworksService],
})
export class NetworksModule {}
