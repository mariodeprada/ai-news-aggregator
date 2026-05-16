import { Injectable } from '@nestjs/common';
import {
  ArticleStatus,
  NewsArticle,
  NewsArticleRepositoryPort,
} from '@ai-news-aggregator/news-article';
import { CmsPublicationException } from '../../domain/errors/cms-publication.exception';
import { Cms } from '../../domain/entities/cms';
import { CmsPort } from '../../domain/ports/cms.port';

@Injectable()
export class PublishArticleUseCase {
  constructor(
    private readonly cmsPort: CmsPort,
    private readonly newsArticleRepository: NewsArticleRepositoryPort,
  ) {}

  async execute(article: NewsArticle, cms: Cms): Promise<void> {
    if (article.status !== ArticleStatus.APPROVED) {
      return;
    }

    if (!article.summarized) {
      return;
    }

    try {
      await this.cmsPort.publishArticle(article, cms);
      article.publish();
      await this.newsArticleRepository.update(article);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown CMS error';
      throw new CmsPublicationException(message);
    }
  }
}
