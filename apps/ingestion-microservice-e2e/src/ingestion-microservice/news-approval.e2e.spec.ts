import {
  ArticleStatus,
  ArgumentError,
  NewsArticle,
} from '@ai-news-aggregator/news-article';
import {
  IngestionE2eContext,
  createIngestionE2eApp,
  resetIngestionE2eContext,
} from '../support/ingestion-e2e-app';

describe('News Approval E2E', () => {
  let context: IngestionE2eContext;

  beforeEach(async () => {
    context = await createIngestionE2eApp();
  });

  afterEach(async () => {
    await resetIngestionE2eContext(context);
    await context.app.close();
  });

  it('Successfully approving a candidate article', async () => {
    const article = new NewsArticle(
      'article-1',
      'https://example.com/article-1',
      'Quantum Computing Breakthrough',
      'Test content for quantum computing article',
      'Test Author',
      'https://example.com/image.jpg',
      'source-1',
      ArticleStatus.CANDIDATE,
      false,
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T00:00:00Z'),
    );
    await context.articleRepository.save(article);

    const originalUpdatedAt = article.updatedAt;
    await context.approveArticle.execute('article-1');

    const updatedArticle = await context.articleRepository.findById('article-1');
    expect(updatedArticle).not.toBeNull();
    expect(updatedArticle?.status).toBe(ArticleStatus.APPROVED);
    expect(updatedArticle?.updatedAt.getTime()).toBeGreaterThan(
      originalUpdatedAt.getTime(),
    );
  });

  it('Rejecting an irrelevant article', async () => {
    const article = new NewsArticle(
      'article-1',
      'https://example.com/article-1',
      'Quantum Computing Breakthrough',
      'Test content',
      'Test Author',
      'https://example.com/image.jpg',
      'source-1',
      ArticleStatus.CANDIDATE,
      false,
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T00:00:00Z'),
    );
    await context.articleRepository.save(article);

    const originalUpdatedAt = article.updatedAt;
    await context.rejectArticle.execute('article-1');

    const updatedArticle = await context.articleRepository.findById('article-1');
    expect(updatedArticle).not.toBeNull();
    expect(updatedArticle?.status).toBe(ArticleStatus.REJECTED);
    expect(updatedArticle?.updatedAt.getTime()).toBeGreaterThan(
      originalUpdatedAt.getTime(),
    );
  });

  it('Preventing approval of an already rejected article', async () => {
    const article = new NewsArticle(
      'article-1',
      'https://example.com/article-1',
      'Quantum Computing Breakthrough',
      'Test content',
      'Test Author',
      'https://example.com/image.jpg',
      'source-1',
      ArticleStatus.REJECTED,
      false,
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T00:00:00Z'),
    );
    await context.articleRepository.save(article);

    let error: Error | null = null;
    try {
      await context.approveArticle.execute('article-1');
    } catch (e) {
      error = e as Error;
    }

    const updatedArticle = await context.articleRepository.findById('article-1');
    expect(updatedArticle?.status).toBe(ArticleStatus.REJECTED);
    expect(error).toBeInstanceOf(ArgumentError);
    expect(error?.message).toBe(
      'Cannot approve an article with status REJECTED',
    );
  });
});
