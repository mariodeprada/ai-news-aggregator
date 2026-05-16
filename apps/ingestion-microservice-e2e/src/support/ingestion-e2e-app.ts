import { AppModule } from '@ai-news-aggregator/ingestion-microservice/app/app.module';
import { ApproveArticleUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/approve-article.use-case';
import { GetArticlesToNotifyUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/get-articles-to-notify.use-case';
import { ProcessScheduledPullUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/process-scheduled-pull.use-case';
import { RejectArticleUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/reject-article.use-case';
import { SendBatchNotificationUseCase } from '@ai-news-aggregator/ingestion-microservice/core/application/use-cases/send-batch-notification.use-case';
import { PullSourceExtractorPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-extractor.port';
import { PullSourceRepositoryPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-repository.port';
import { NotificationPort } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/notification.port';
import { InMemoryPullSourceExtractor } from '@ai-news-aggregator/ingestion-microservice/core/domain/test/mocks/in-memory-pull-source.extractor';
import { InMemoryPullSourceRepository } from '@ai-news-aggregator/ingestion-microservice/core/domain/test/mocks/in-memory-pull-source.repository';
import { InMemoryNotificationRepository } from '@ai-news-aggregator/ingestion-microservice/core/domain/test/mocks/in-memory-notification.repository';
import { SupabaseClientProvider } from '@ai-news-aggregator/ingestion-microservice/infrastructure/config/supabase-client.provider';
import {
  InMemoryNewsArticleRepository,
  NewsArticleRepositoryPort,
} from '@ai-news-aggregator/news-article';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

export interface IngestionE2eContext {
  app: INestApplication;
  articleRepository: InMemoryNewsArticleRepository;
  pullSourceRepository: InMemoryPullSourceRepository;
  pullSourceExtractor: InMemoryPullSourceExtractor;
  notification: InMemoryNotificationRepository;
  approveArticle: ApproveArticleUseCase;
  rejectArticle: RejectArticleUseCase;
  processScheduledPull: ProcessScheduledPullUseCase;
  sendBatchNotification: SendBatchNotificationUseCase;
  getArticlesToNotify: GetArticlesToNotifyUseCase;
}

export async function createIngestionE2eApp(): Promise<IngestionE2eContext> {
  const articleRepository = new InMemoryNewsArticleRepository();
  const pullSourceRepository = new InMemoryPullSourceRepository();
  const pullSourceExtractor = new InMemoryPullSourceExtractor();
  const notification = new InMemoryNotificationRepository();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(SupabaseClientProvider)
    .useValue({})
    .overrideProvider(NewsArticleRepositoryPort)
    .useValue(articleRepository)
    .overrideProvider(PullSourceRepositoryPort)
    .useValue(pullSourceRepository)
    .overrideProvider(PullSourceExtractorPort)
    .useValue(pullSourceExtractor)
    .overrideProvider(NotificationPort)
    .useValue(notification)
    .compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();

  const approveArticle = new ApproveArticleUseCase(articleRepository);
  const rejectArticle = new RejectArticleUseCase(articleRepository);
  const getArticlesToNotify = new GetArticlesToNotifyUseCase(articleRepository);
  const processScheduledPull = new ProcessScheduledPullUseCase(
    pullSourceRepository,
    articleRepository,
    pullSourceExtractor,
  );
  const sendBatchNotification = new SendBatchNotificationUseCase(
    getArticlesToNotify,
    articleRepository,
    notification,
  );

  return {
    app,
    articleRepository,
    pullSourceRepository,
    pullSourceExtractor,
    notification,
    approveArticle,
    rejectArticle,
    processScheduledPull,
    sendBatchNotification,
    getArticlesToNotify,
  };
}

export async function resetIngestionE2eContext(
  context: IngestionE2eContext,
): Promise<void> {
  context.articleRepository.clear();
  context.pullSourceRepository.clear();
  context.pullSourceExtractor.clear();
  context.notification.clear();
}
