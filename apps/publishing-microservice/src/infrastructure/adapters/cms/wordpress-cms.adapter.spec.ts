import { ArticleStatus, NewsArticle } from '@ai-news-aggregator/news-article';
import { CmsPublicationException } from '../../../core/domain/errors/cms-publication.exception';
import { WordpressCms } from '../../../core/domain/entities/cms';
import { CmsCredentialsProvider } from '../../config/cms-credentials.provider';
import { WordpressCmsAdapter } from './wordpress-cms.adapter';

describe('WordpressCmsAdapter', () => {
  let adapter: WordpressCmsAdapter;
  let fetchSpy: jest.SpiedFunction<typeof fetch>;
  let cmsCredentialsProvider: jest.Mocked<CmsCredentialsProvider>;

  beforeEach(() => {
    cmsCredentialsProvider = {
      getWordpressApplicationPassword: jest.fn().mockReturnValue('app-password'),
    } as unknown as jest.Mocked<CmsCredentialsProvider>;
    adapter = new WordpressCmsAdapter(cmsCredentialsProvider);
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('should publish an article to wordpress', async () => {
    const article = new NewsArticle(
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
    );
    const cms = new WordpressCms(
      'cms-1',
      null,
      true,
      'https://example.com',
      'editor',
      'wordpress-main',
    );

    fetchSpy.mockResolvedValue({
      ok: true,
      status: 201,
    } as Response);

    await expect(adapter.publishArticle(article, cms)).resolves.toBeUndefined();

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://example.com/wp-json/wp/v2/posts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Basic '),
        }),
        body: JSON.stringify({
          title: 'Article 1',
          content:
            'Summary 1\n\n<p><a href="https://example.com/article-1" target="_blank" rel="noopener noreferrer">Read the original article</a></p>',
          status: 'publish',
        }),
      }),
    );
    expect(
      cmsCredentialsProvider.getWordpressApplicationPassword,
    ).toHaveBeenCalledWith('wordpress-main');
  });

  it('should throw CmsPublicationException when wordpress returns an error', async () => {
    const article = new NewsArticle(
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
    );
    const cms = new WordpressCms(
      'cms-1',
      null,
      true,
      'https://example.com',
      'editor',
      'wordpress-main',
    );

    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(adapter.publishArticle(article, cms)).rejects.toThrow(
      CmsPublicationException,
    );
  });
});
