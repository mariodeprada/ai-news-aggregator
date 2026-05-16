import {
  ArticleStatus,
  NewsArticle,
} from '@ai-news-aggregator/news-article';
import { WordpressCms } from '../../../publishing-microservice/src/core/domain/entities/cms';
import {
  createPublishingE2eApp,
  PublishingE2eContext,
  resetPublishingE2eContext,
} from '../support/publishing-e2e-app';

function createFeatureArticle(
  status: ArticleStatus,
  generatedSummary?: string | null,
): NewsArticle {
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

function createCms(): WordpressCms {
  return new WordpressCms(
    'cms-1',
    null,
    true,
    'https://cms-1.example.com',
    'editor',
    'cms-1-credentials',
  );
}

describe('Publish Article E2E', () => {
  let context: PublishingE2eContext;

  beforeEach(async () => {
    context = await createPublishingE2eApp();
  });

  afterEach(async () => {
    await resetPublishingE2eContext(context);
    await context.app.close();
  });

  it('Successfully publishing a summarized approved article', async () => {
    const article = createFeatureArticle(
      ArticleStatus.APPROVED,
      'Generated summary',
    );
    const cms = createCms();
    await context.articleRepository.save(article);
    await context.cmsRepository.save(cms);

    await context.publishArticle.execute(article, cms);

    const updatedArticle = await context.articleRepository.findById(article.id);
    expect(context.cmsPublisher.getPublishedArticles()).toEqual([
      { articleId: 'article-1', cmsId: 'cms-1' },
    ]);
    expect(updatedArticle?.status).toBe(ArticleStatus.PUBLISHED);
  });

  it('Skipping articles that are not summarized', async () => {
    const article = createFeatureArticle(ArticleStatus.APPROVED, null);
    const cms = createCms();
    await context.articleRepository.save(article);
    await context.cmsRepository.save(cms);

    await context.publishArticle.execute(article, cms);

    const updatedArticle = await context.articleRepository.findById(article.id);
    expect(context.cmsPublisher.getPublishedArticles()).toEqual([]);
    expect(updatedArticle?.status).toBe(ArticleStatus.APPROVED);
  });

  it('Skipping articles that are not approved', async () => {
    const article = createFeatureArticle(
      ArticleStatus.REJECTED,
      'Generated summary',
    );
    const cms = createCms();
    await context.articleRepository.save(article);
    await context.cmsRepository.save(cms);

    await context.publishArticle.execute(article, cms);

    const updatedArticle = await context.articleRepository.findById(article.id);
    expect(context.cmsPublisher.getPublishedArticles()).toEqual([]);
    expect(updatedArticle?.status).toBe(ArticleStatus.REJECTED);
  });
});
