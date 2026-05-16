import {
  ArticleStatus,
  InMemoryNewsArticleRepository,
  NewsArticle,
} from '@ai-news-aggregator/news-article';
import { SendNotificationError } from '../../domain/errors/send-notification.error';
import { NotificationPort } from '../../domain/ports/notification.port';
import { InMemoryNotificationRepository } from '../../domain/test/mocks/in-memory-notification.repository';
import { GetArticlesToNotifyUseCase } from '../use-cases/get-articles-to-notify.use-case';
import { SendBatchNotificationUseCase } from '../use-cases/send-batch-notification.use-case';

describe('SendBatchNotificationUseCase', () => {
  let useCase: SendBatchNotificationUseCase;
  let articleRepository: InMemoryNewsArticleRepository;
  let notification: InMemoryNotificationRepository;
  let getArticlesToNotify: GetArticlesToNotifyUseCase;

  beforeEach(() => {
    articleRepository = new InMemoryNewsArticleRepository();
    notification = new InMemoryNotificationRepository();
    getArticlesToNotify = new GetArticlesToNotifyUseCase(articleRepository);
    useCase = new SendBatchNotificationUseCase(
      getArticlesToNotify,
      articleRepository,
      notification,
    );
  });

  describe('execute', () => {
    it('should send notification for unnotified CANDIDATE articles', async () => {
      const article1 = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Article 1',
        'Content 1',
        'Author 1',
        'https://example.com/image1.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );

      const article2 = new NewsArticle(
        'article-2',
        'https://example.com/article-2',
        'Article 2',
        'Content 2',
        'Author 2',
        'https://example.com/image2.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );

      await articleRepository.save(article1);
      await articleRepository.save(article2);

      await useCase.execute();

      const lastNotification = notification.getLastNotification();
      expect(lastNotification).not.toBeNull();
      expect(lastNotification?.length).toBe(2);
    });

    it('should mark articles as notified after sending', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Article 1',
        'Content 1',
        'Author 1',
        'https://example.com/image1.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );

      await articleRepository.save(article);

      await useCase.execute();

      const allArticles = await articleRepository.find();
      expect(allArticles[0].notified).toBe(true);
    });

    it('should skip articles that are already notified', async () => {
      const notifiedArticle = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Article 1',
        'Content 1',
        'Author 1',
        'https://example.com/image1.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        true,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );

      const unnotifiedArticle = new NewsArticle(
        'article-2',
        'https://example.com/article-2',
        'Article 2',
        'Content 2',
        'Author 2',
        'https://example.com/image2.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );

      await articleRepository.save(notifiedArticle);
      await articleRepository.save(unnotifiedArticle);

      await useCase.execute();

      const lastNotification = notification.getLastNotification();
      expect(lastNotification?.length).toBe(1);
      expect(lastNotification?.[0].articleId).toBe('article-2');
    });

    it('should skip articles that are not CANDIDATE status', async () => {
      const candidateArticle = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Article 1',
        'Content 1',
        'Author 1',
        'https://example.com/image1.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );

      const approvedArticle = new NewsArticle(
        'article-2',
        'https://example.com/article-2',
        'Article 2',
        'Content 2',
        'Author 2',
        'https://example.com/image2.jpg',
        'source-1',
        ArticleStatus.APPROVED,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );

      await articleRepository.save(candidateArticle);
      await articleRepository.save(approvedArticle);

      await useCase.execute();

      const lastNotification = notification.getLastNotification();
      expect(lastNotification?.length).toBe(1);
    });

    it('should do nothing when there are no articles', async () => {
      await useCase.execute();

      const lastNotification = notification.getLastNotification();
      expect(lastNotification).toBeNull();
    });

    it('should do nothing when there are no unnotified CANDIDATE articles', async () => {
      await useCase.execute();

      const lastNotification = notification.getLastNotification();
      expect(lastNotification).toBeNull();
    });

    it('should format notification data correctly', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Test Article Title',
        'Content',
        'Test Author',
        'https://example.com/image.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );

      await articleRepository.save(article);

      await useCase.execute();

      const lastNotification = notification.getLastNotification();
      expect(lastNotification?.[0]).toEqual({
        articleId: 'article-1',
        title: 'Test Article Title',
        articleUrl: 'https://example.com/article-1',
        mainImageUrl: 'https://example.com/image.jpg',
        originalAuthor: 'Test Author',
      });
    });

    it('should throw SendNotificationError when notification fails', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Article 1',
        'Content 1',
        'Author 1',
        'https://example.com/image1.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );

      await articleRepository.save(article);

      class FailingNotificationRepository implements NotificationPort {
        async sendBatchNotification(): Promise<void> {
          throw new Error('Notification provider failed');
        }
      }

      const failingNotification = new FailingNotificationRepository();
      const failingUseCase = new SendBatchNotificationUseCase(
        getArticlesToNotify,
        articleRepository,
        failingNotification,
      );

      await expect(failingUseCase.execute()).rejects.toThrow(
        SendNotificationError,
      );
      await expect(failingUseCase.execute()).rejects.toThrow(
        'Failed to send notification: Notification provider failed',
      );
    });

    it('should not mark articles as notified when notification fails', async () => {
      const article = new NewsArticle(
        'article-1',
        'https://example.com/article-1',
        'Article 1',
        'Content 1',
        'Author 1',
        'https://example.com/image1.jpg',
        'source-1',
        ArticleStatus.CANDIDATE,
        false,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      );

      await articleRepository.save(article);

      class FailingNotificationRepository implements NotificationPort {
        async sendBatchNotification(): Promise<void> {
          throw new Error('Notification provider failed');
        }
      }

      const failingNotification = new FailingNotificationRepository();
      const failingUseCase = new SendBatchNotificationUseCase(
        getArticlesToNotify,
        articleRepository,
        failingNotification,
      );

      try {
        await failingUseCase.execute();
      } catch (error) {
        // Expected error
      }

      const allArticles = await articleRepository.find();
      expect(allArticles[0].notified).toBe(false);
    });
  });
});
