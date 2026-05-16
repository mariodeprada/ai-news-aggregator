import {
  ArticleStatus,
  InMemoryNewsArticleRepository,
  NewsArticle,
  NewsArticleRepositoryPort,
} from '@ai-news-aggregator/news-article';
import { WordpressCms } from '../../domain/entities/cms';
import { PublishArticleUseCase } from '../use-cases/publish-article.use-case';
import { CmsPublicationException } from '../../domain/errors/cms-publication.exception';
import { CmsPort } from '../../domain/ports/cms.port';
import { InMemoryCmsPublisher } from '../../domain/test/mocks/in-memory-cms-publisher';

describe('PublishArticleUseCase', () => {
  let publishArticleUseCase: PublishArticleUseCase;
  let cmsPort: CmsPort;
  let newsArticleRepository: NewsArticleRepositoryPort;
  let cms: WordpressCms;
  beforeEach(() => {
    cmsPort = new InMemoryCmsPublisher();
    newsArticleRepository = new InMemoryNewsArticleRepository();
    cms = new WordpressCms(
      'cms-1',
      null,
      true,
      'https://example.com',
      'editor',
      'wordpress-main',
    );
    publishArticleUseCase = new PublishArticleUseCase(
      cmsPort,
      newsArticleRepository,
    );
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(publishArticleUseCase).toBeDefined();
    });
  });

  describe('execute', () => {
    const createArticle = (
      status: ArticleStatus = ArticleStatus.APPROVED,
      generatedSummary?: string | null,
    ) =>
      new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Test Article',
        'This is a test article.',
        'John Doe',
        'https://example.com/image.jpg',
        'source-1',
        status,
        false,
        new Date('2026-05-16T10:00:00.000Z'),
        new Date('2026-05-16T10:00:00.000Z'),
        generatedSummary,
      );

    it('should publish an article successfully', async () => {
      const article = createArticle(
        ArticleStatus.APPROVED,
        'This is the generated summary.',
      );
      await newsArticleRepository.save(article);

      const publishArticleSpy = jest.spyOn(cmsPort, 'publishArticle');
      const updateSpy = jest.spyOn(newsArticleRepository, 'update');

      await expect(
        publishArticleUseCase.execute(article, cms),
      ).resolves.toBeUndefined();

      expect(publishArticleSpy).toHaveBeenCalledWith(article, cms);
      expect(updateSpy).toHaveBeenCalledWith(article);
      expect(article.status).toBe(ArticleStatus.PUBLISHED);
    });

    it('should throw a CmsPublicationException if publishing fails', async () => {
      const article = createArticle(
        ArticleStatus.APPROVED,
        'This is the generated summary.',
      );
      await newsArticleRepository.save(article);

      cmsPort.publishArticle = jest
        .fn()
        .mockRejectedValue(new Error('CMS error'));

      await expect(
        publishArticleUseCase.execute(article, cms),
      ).rejects.toThrow(CmsPublicationException);
    });

    it('should skip articles that are not summarized', async () => {
      const article = createArticle(ArticleStatus.APPROVED, null);

      const publishArticleSpy = jest.spyOn(cmsPort, 'publishArticle');
      const updateSpy = jest.spyOn(newsArticleRepository, 'update');

      await expect(
        publishArticleUseCase.execute(article, cms),
      ).resolves.toBeUndefined();

      expect(publishArticleSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(article.status).toBe(ArticleStatus.APPROVED);
    });

    it('should skip articles that are not approved', async () => {
      const article = createArticle(
        ArticleStatus.REJECTED,
        'This is the generated summary.',
      );

      const publishArticleSpy = jest.spyOn(cmsPort, 'publishArticle');
      const updateSpy = jest.spyOn(newsArticleRepository, 'update');

      await expect(
        publishArticleUseCase.execute(article, cms),
      ).resolves.toBeUndefined();

      expect(publishArticleSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(article.status).toBe(ArticleStatus.REJECTED);
    });
  });
});
