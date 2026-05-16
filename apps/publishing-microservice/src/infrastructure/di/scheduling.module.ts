import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GetArticlesToPublishUseCase } from '../../core/application/use-cases/get-articles-to-publish.use-case';
import { GetCmsToPublishUseCase } from '../../core/application/use-cases/get-cms-to-publish.use-case';
import { ProcessScheduledPublicationUseCase } from '../../core/application/use-cases/process-scheduled-publication.use-case';
import { PublishArticleUseCase } from '../../core/application/use-cases/publish-article.use-case';
import { PublishArticlesScheduler } from '../scheduling/publish-articles.scheduler';
import { CmsModule } from './cms.module';
import { PersistenceModule } from './persistence.module';

@Module({
  imports: [ScheduleModule.forRoot(), PersistenceModule, CmsModule],
  providers: [
    GetArticlesToPublishUseCase,
    GetCmsToPublishUseCase,
    PublishArticleUseCase,
    ProcessScheduledPublicationUseCase,
    PublishArticlesScheduler,
  ],
  exports: [
    GetArticlesToPublishUseCase,
    GetCmsToPublishUseCase,
    PublishArticleUseCase,
    ProcessScheduledPublicationUseCase,
  ],
})
export class SchedulingModule {}
