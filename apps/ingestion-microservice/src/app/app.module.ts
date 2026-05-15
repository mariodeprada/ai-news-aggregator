import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/di/infrastructure.module.js';
import { ReviewController } from './review.controller';

@Module({
  imports: [InfrastructureModule],
  controllers: [ReviewController],
  providers: [],
})
export class AppModule {}
