import {
  ArticleStatus,
  InMemoryNewsArticleRepository,
  NewsArticle,
} from '@ai-news-aggregator/news-article';
import { GetArticlesToPublishUseCase } from '../use-cases/get-articles-to-publish.use-case';

describe('GetArticlesToPublishUseCase', () => {
  let repository: InMemoryNewsArticleRepository;
  let useCase: GetArticlesToPublishUseCase;

  beforeEach(() => {
    repository = new InMemoryNewsArticleRepository();
    useCase = new GetArticlesToPublishUseCase(repository);
  });

  it('should return approved summarized articles only', async () => {
    await repository.save(
      new NewsArticle(
        '1',
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
    await repository.save(
      new NewsArticle(
        '2',
        'https://example.com/article-2',
        'Article 2',
        'Content 2',
        'Author 2',
        null,
        'source-2',
        ArticleStatus.APPROVED,
      ),
    );

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});
