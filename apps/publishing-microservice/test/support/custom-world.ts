import { World, IWorldOptions } from '@cucumber/cucumber';
import {
  ArticleStatus,
  InMemoryNewsArticleRepository,
  NewsArticle,
} from '@ai-news-aggregator/news-article';
import { GetArticlesToPublishUseCase } from '../../src/core/application/use-cases/get-articles-to-publish.use-case';
import { GetCmsToPublishUseCase } from '../../src/core/application/use-cases/get-cms-to-publish.use-case';
import { ProcessScheduledPublicationUseCase } from '../../src/core/application/use-cases/process-scheduled-publication.use-case';
import { PublishArticleUseCase } from '../../src/core/application/use-cases/publish-article.use-case';
import { WordpressCms } from '../../src/core/domain/entities/cms';
import { InMemoryCmsPublisher } from '../../src/core/domain/test/mocks/in-memory-cms-publisher';
import { InMemoryCmsRepository } from '../../src/core/domain/test/mocks/in-memory-cms.repository';

export class CustomWorld extends World {
  public articleRepository: InMemoryNewsArticleRepository;
  public cmsRepository: InMemoryCmsRepository;
  public cmsPublisher: InMemoryCmsPublisher;
  public getArticlesToPublishUseCase: GetArticlesToPublishUseCase;
  public getCmsToPublishUseCase: GetCmsToPublishUseCase;
  public publishArticleUseCase: PublishArticleUseCase;
  public processScheduledPublicationUseCase: ProcessScheduledPublicationUseCase;
  public currentArticle: NewsArticle | null = null;
  public currentCms: WordpressCms | null = null;
  public dueCms: WordpressCms[] = [];
  public processResult:
    | { success: string[]; errors: { cmsId: string; error: Error }[]; published: number }
    | null = null;
  public publicationError: Error | null = null;

  constructor(options: IWorldOptions) {
    super(options);
    this.articleRepository = new InMemoryNewsArticleRepository();
    this.cmsRepository = new InMemoryCmsRepository();
    this.cmsPublisher = new InMemoryCmsPublisher();
    this.getArticlesToPublishUseCase = new GetArticlesToPublishUseCase(
      this.articleRepository,
    );
    this.getCmsToPublishUseCase = new GetCmsToPublishUseCase(this.cmsRepository);
    this.publishArticleUseCase = new PublishArticleUseCase(
      this.cmsPublisher,
      this.articleRepository,
    );
    this.processScheduledPublicationUseCase =
      new ProcessScheduledPublicationUseCase(
        this.cmsRepository,
        this.getCmsToPublishUseCase,
        this.getArticlesToPublishUseCase,
        this.publishArticleUseCase,
      );
  }

  reset(): void {
    this.articleRepository.clear();
    this.cmsRepository.clear();
    this.cmsPublisher.clear();
    this.currentArticle = null;
    this.currentCms = null;
    this.dueCms = [];
    this.processResult = null;
    this.publicationError = null;
  }

  createArticle(status: ArticleStatus, generatedSummary?: string | null): NewsArticle {
    return new NewsArticle(
      'article-1',
      'https://example.com/article-1',
      'Test Article',
      'Test content',
      'Test Author',
      'https://example.com/image.jpg',
      'source-1',
      status,
      false,
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T00:00:00Z'),
      generatedSummary,
    );
  }

  createCms(id: string, lastPublishedAt: Date | null = new Date('2024-01-01T00:00:00Z')): WordpressCms {
    return new WordpressCms(
      id,
      lastPublishedAt,
      true,
      `https://${id}.example.com`,
      'editor',
      `${id}-credentials`,
    );
  }
}
