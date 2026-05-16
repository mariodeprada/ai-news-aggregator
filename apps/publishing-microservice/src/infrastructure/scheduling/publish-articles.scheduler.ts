import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessScheduledPublicationUseCase } from '../../core/application/use-cases/process-scheduled-publication.use-case';
import { getSchedulingConfig } from '../config/scheduling.config';

@Injectable()
export class PublishArticlesScheduler {
  private readonly logger = new Logger(PublishArticlesScheduler.name);
  private readonly config = getSchedulingConfig();
  private isRunning = false;

  constructor(
    private readonly processScheduledPublication: ProcessScheduledPublicationUseCase,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handlePublication(): Promise<void> {
    if (!this.config.publishArticlesSchedulerEnabled) {
      this.logger.debug('Publish articles scheduler disabled by configuration');
      return;
    }

    if (this.isRunning) {
      this.logger.debug('Publish articles scheduler already in progress - skipping');
      return;
    }

    this.logger.log('Running scheduled article publication...');
    this.isRunning = true;

    try {
      const result = await this.processScheduledPublication.execute();

      this.logger.log(
        `Scheduled article publication completed: ${result.published} articles published`,
      );
    } catch (error) {
      const errorObj = error as Error;
      this.logger.error(`Scheduled article publication failed: ${errorObj.message}`);
      this.logger.debug(`Stack trace: ${errorObj.stack}`);
    } finally {
      this.isRunning = false;
    }
  }
}
