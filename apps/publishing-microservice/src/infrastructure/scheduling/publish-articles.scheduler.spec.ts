import { PublishArticlesScheduler } from './publish-articles.scheduler';
import { ProcessScheduledPublicationUseCase } from '../../core/application/use-cases/process-scheduled-publication.use-case';

describe('PublishArticlesScheduler', () => {
  let scheduler: PublishArticlesScheduler;
  let processScheduledPublication: jest.Mocked<ProcessScheduledPublicationUseCase>;

  beforeEach(() => {
    processScheduledPublication = {
      execute: jest.fn().mockResolvedValue({
        success: [],
        errors: [],
        published: 0,
      }),
    } as unknown as jest.Mocked<ProcessScheduledPublicationUseCase>;

    scheduler = new PublishArticlesScheduler(processScheduledPublication);
  });

  it('should run scheduled publication when enabled', async () => {
    const previousValue = process.env.PUBLISH_ARTICLES_SCHEDULER_ENABLED;
    process.env.PUBLISH_ARTICLES_SCHEDULER_ENABLED = 'true';

    await scheduler.handlePublication();

    expect(processScheduledPublication.execute).toHaveBeenCalled();
    process.env.PUBLISH_ARTICLES_SCHEDULER_ENABLED = previousValue;
  });
});
