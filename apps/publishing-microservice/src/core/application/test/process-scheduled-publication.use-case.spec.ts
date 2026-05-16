import {
  ArticleStatus,
  InMemoryNewsArticleRepository,
  NewsArticle,
} from '@ai-news-aggregator/news-article';
import { WordpressCms } from '../../domain/entities/cms';
import { InMemoryCmsPublisher } from '../../domain/test/mocks/in-memory-cms-publisher';
import { InMemoryCmsRepository } from '../../domain/test/mocks/in-memory-cms.repository';
import { GetArticlesToPublishUseCase } from '../use-cases/get-articles-to-publish.use-case';
import { GetCmsToPublishUseCase } from '../use-cases/get-cms-to-publish.use-case';
import { ProcessScheduledPublicationUseCase } from '../use-cases/process-scheduled-publication.use-case';
import { PublishArticleUseCase } from '../use-cases/publish-article.use-case';

describe('ProcessScheduledPublicationUseCase', () => {
  let cmsRepository: InMemoryCmsRepository;
  let newsArticleRepository: InMemoryNewsArticleRepository;
  let cmsPublisher: InMemoryCmsPublisher;
  let getCmsToPublish: GetCmsToPublishUseCase;
  let getArticlesToPublish: GetArticlesToPublishUseCase;
  let publishArticle: PublishArticleUseCase;
  let useCase: ProcessScheduledPublicationUseCase;

  beforeEach(() => {
    cmsRepository = new InMemoryCmsRepository();
    newsArticleRepository = new InMemoryNewsArticleRepository();
    cmsPublisher = new InMemoryCmsPublisher();
    getCmsToPublish = new GetCmsToPublishUseCase(cmsRepository);
    getArticlesToPublish = new GetArticlesToPublishUseCase(newsArticleRepository);
    publishArticle = new PublishArticleUseCase(
      cmsPublisher,
      newsArticleRepository,
    );
    useCase = new ProcessScheduledPublicationUseCase(
      cmsRepository,
      getCmsToPublish,
      getArticlesToPublish,
      publishArticle,
    );
  });

  it('should publish approved summarized articles to every due cms', async () => {
    await cmsRepository.save(
      new WordpressCms(
        'cms-1',
        new Date('2024-01-01T00:00:00Z'),
        true,
        'https://example.com',
        'editor',
        'wordpress-main',
      ),
    );
    await newsArticleRepository.save(
      new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Article 1',
        'Content 1',
        'Author 1',
        null,
        'source-1',
        ArticleStatus.APPROVED,
        false,
        new Date(),
        new Date(),
        'Summary 1',
      ),
    );

    const result = await useCase.execute();
    const publishedArticles = cmsPublisher.getPublishedArticles();
    const updatedArticle = await newsArticleRepository.findById('article-1');

    expect(result.success).toContain('cms-1');
    expect(result.errors).toEqual([]);
    expect(result.published).toBe(1);
    expect(publishedArticles).toEqual([
      { articleId: 'article-1', cmsId: 'cms-1' },
    ]);
    expect(updatedArticle?.status).toBe(ArticleStatus.PUBLISHED);
  });
});
