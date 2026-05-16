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
  generatedSummary = 'Generated summary',
): NewsArticle {
  return new NewsArticle(
    'article-1',
    'https://example.com/article-1',
    'Test Article',
    'Test content',
    'Test Author',
    'https://example.com/image.jpg',
    'source-1',
    ArticleStatus.APPROVED,
    false,
    new Date('2024-01-01T00:00:00Z'),
    new Date('2024-01-01T00:00:00Z'),
    generatedSummary,
  );
}

function createCms(id: string, lastPublishedAt: Date): WordpressCms {
  return new WordpressCms(
    id,
    lastPublishedAt,
    true,
    `https://${id}.example.com`,
    'editor',
    `${id}-credentials`,
  );
}

describe('Scheduled Publication E2E', () => {
  let context: PublishingE2eContext;

  beforeEach(async () => {
    context = await createPublishingE2eApp();
  });

  afterEach(async () => {
    await resetPublishingE2eContext(context);
    await context.app.close();
  });

  it('Processing every due CMS in a single cycle', async () => {
    await context.cmsRepository.save(
      createCms('cms-1', new Date('2024-01-01T00:00:00Z')),
    );
    await context.cmsRepository.save(
      createCms('cms-2', new Date('2024-01-01T00:00:00Z')),
    );
    await context.articleRepository.save(createFeatureArticle());

    await context.processScheduledPublication.execute();
    const firstCms = await context.cmsRepository.findById('cms-1');
    const secondCms = await context.cmsRepository.findById('cms-2');

    expect(firstCms?.lastPublishedAt?.getTime()).toBeGreaterThan(
      new Date('2024-01-01T00:00:00Z').getTime(),
    );
    expect(secondCms?.lastPublishedAt?.getTime()).toBeGreaterThan(
      new Date('2024-01-01T00:00:00Z').getTime(),
    );
  });

  it('Skipping the cycle when no CMS is due', async () => {
    await context.cmsRepository.save(
      createCms('cms-1', new Date('2099-01-01T00:00:00Z')),
    );
    await context.articleRepository.save(createFeatureArticle());

    await context.processScheduledPublication.execute();

    expect(context.cmsPublisher.getPublishedArticles()).toEqual([]);
  });

  it('Continuing with the remaining CMS when one CMS fails', async () => {
    await context.cmsRepository.save(
      createCms('cms-1', new Date('2024-01-01T00:00:00Z')),
    );
    await context.cmsRepository.save(
      createCms('cms-2', new Date('2024-01-01T00:00:00Z')),
    );
    await context.articleRepository.save(createFeatureArticle());
    context.cmsPublisher.setErrorForCms('cms-1', new Error('CMS failure'));

    const result = await context.processScheduledPublication.execute();

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.cmsId).toBe('cms-1');
    expect(result.success).toContain('cms-2');
    expect(context.cmsPublisher.getPublishedArticles()).toEqual([
      { articleId: 'article-1', cmsId: 'cms-2' },
    ]);
  });
});
