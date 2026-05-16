import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  InMemoryNewsArticleRepository,
  NewsArticleRepositoryPort,
} from '@ai-news-aggregator/news-article';
import { AppModule } from '../../../publishing-microservice/src/app/app.module';
import { GetArticlesToPublishUseCase } from '../../../publishing-microservice/src/core/application/use-cases/get-articles-to-publish.use-case';
import { GetCmsToPublishUseCase } from '../../../publishing-microservice/src/core/application/use-cases/get-cms-to-publish.use-case';
import { ProcessScheduledPublicationUseCase } from '../../../publishing-microservice/src/core/application/use-cases/process-scheduled-publication.use-case';
import { PublishArticleUseCase } from '../../../publishing-microservice/src/core/application/use-cases/publish-article.use-case';
import { CmsRepositoryPort } from '../../../publishing-microservice/src/core/domain/ports/cms-repository.port';
import { CmsPort } from '../../../publishing-microservice/src/core/domain/ports/cms.port';
import { InMemoryCmsPublisher } from '../../../publishing-microservice/src/core/domain/test/mocks/in-memory-cms-publisher';
import { InMemoryCmsRepository } from '../../../publishing-microservice/src/core/domain/test/mocks/in-memory-cms.repository';

export interface PublishingE2eContext {
  app: INestApplication;
  articleRepository: InMemoryNewsArticleRepository;
  cmsRepository: InMemoryCmsRepository;
  cmsPublisher: InMemoryCmsPublisher;
  publishArticle: PublishArticleUseCase;
  processScheduledPublication: ProcessScheduledPublicationUseCase;
  getArticlesToPublish: GetArticlesToPublishUseCase;
  getCmsToPublish: GetCmsToPublishUseCase;
}

export async function createPublishingE2eApp(): Promise<PublishingE2eContext> {
  const articleRepository = new InMemoryNewsArticleRepository();
  const cmsRepository = new InMemoryCmsRepository();
  const cmsPublisher = new InMemoryCmsPublisher();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(NewsArticleRepositoryPort)
    .useValue(articleRepository)
    .overrideProvider(CmsRepositoryPort)
    .useValue(cmsRepository)
    .overrideProvider(CmsPort)
    .useValue(cmsPublisher)
    .compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();

  return {
    app,
    articleRepository,
    cmsRepository,
    cmsPublisher,
    publishArticle: moduleRef.get(PublishArticleUseCase),
    processScheduledPublication: moduleRef.get(
      ProcessScheduledPublicationUseCase,
    ),
    getArticlesToPublish: moduleRef.get(GetArticlesToPublishUseCase),
    getCmsToPublish: moduleRef.get(GetCmsToPublishUseCase),
  };
}

export async function resetPublishingE2eContext(
  context: PublishingE2eContext,
): Promise<void> {
  context.articleRepository.clear();
  context.cmsRepository.clear();
  context.cmsPublisher.clear();
}
