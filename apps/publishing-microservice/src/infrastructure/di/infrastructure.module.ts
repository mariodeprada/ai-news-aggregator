import { Module } from '@nestjs/common';
import { CmsModule } from './cms.module';
import { PersistenceModule } from './persistence.module';
import { SchedulingModule } from './scheduling.module';

@Module({
  imports: [PersistenceModule, CmsModule, SchedulingModule],
  exports: [PersistenceModule, CmsModule, SchedulingModule],
})
export class InfrastructureModule {}
