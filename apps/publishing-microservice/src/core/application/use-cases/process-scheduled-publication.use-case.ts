import { Injectable, Logger } from '@nestjs/common';
import { CmsRepositoryPort } from '../../domain/ports/cms-repository.port';
import { GetArticlesToPublishUseCase } from './get-articles-to-publish.use-case';
import { GetCmsToPublishUseCase } from './get-cms-to-publish.use-case';
import { PublishArticleUseCase } from './publish-article.use-case';

@Injectable()
export class ProcessScheduledPublicationUseCase {
  private readonly logger = new Logger(ProcessScheduledPublicationUseCase.name);

  constructor(
    private readonly cmsRepository: CmsRepositoryPort,
    private readonly getCmsToPublish: GetCmsToPublishUseCase,
    private readonly getArticlesToPublish: GetArticlesToPublishUseCase,
    private readonly publishArticle: PublishArticleUseCase,
  ) {}

  async execute(): Promise<{
    success: string[];
    errors: { cmsId: string; error: Error }[];
    published: number;
  }> {
    const now = new Date();
    const dueCms = await this.getCmsToPublish.execute(now);
    const articles = await this.getArticlesToPublish.execute();

    const success: string[] = [];
    const errors: { cmsId: string; error: Error }[] = [];
    let published = 0;

    for (const cms of dueCms) {
      try {
        for (const article of articles) {
          const wasPublished = article.status;
          await this.publishArticle.execute(article, cms);
          if (wasPublished !== article.status) {
            published++;
          }
        }

        await this.cmsRepository.updateLastPublishedAt(cms.id, now);
        success.push(cms.id);
      } catch (error) {
        const errorObj = error as Error;
        this.logger.error(
          `Error publishing articles to CMS ${cms.id}: ${errorObj.message}`,
        );
        errors.push({ cmsId: cms.id, error: errorObj });
        await this.cmsRepository.updateLastPublishedAt(cms.id, now);
      }
    }

    return { success, errors, published };
  }
}
