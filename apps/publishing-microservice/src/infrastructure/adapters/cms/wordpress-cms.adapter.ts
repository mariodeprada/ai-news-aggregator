import { Injectable } from '@nestjs/common';
import { NewsArticle } from '@ai-news-aggregator/news-article';
import { CmsPublicationException } from '../../../core/domain/errors/cms-publication.exception';
import { CmsPort } from '../../../core/domain/ports/cms.port';
import { Cms, WordpressCms } from '../../../core/domain/entities/cms';
import { CmsCredentialsProvider } from '../../config/cms-credentials.provider';

@Injectable()
export class WordpressCmsAdapter implements CmsPort {
  constructor(
    private readonly cmsCredentialsProvider: CmsCredentialsProvider,
  ) {}

  async publishArticle(article: NewsArticle, cms: Cms): Promise<void> {
    if (!(cms instanceof WordpressCms)) {
      throw new CmsPublicationException('Unsupported CMS type');
    }

    const applicationPassword =
      this.cmsCredentialsProvider.getWordpressApplicationPassword(
        cms.credentialsRef,
      );
    const authorizationHeader = Buffer.from(
      `${cms.username}:${applicationPassword}`,
    ).toString('base64');
    const originalArticleLink = `<p><a href="${article.articleUrl}" target="_blank" rel="noopener noreferrer">Read the original article</a></p>`;
    const response = await fetch(
      `${cms.baseUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authorizationHeader}`,
        },
        body: JSON.stringify({
          title: article.title,
          content: `${article.generatedSummary}\n\n${originalArticleLink}`,
          status: 'publish',
        }),
      },
    );

    if (!response.ok) {
      throw new CmsPublicationException(
        `WordPress publication failed with status ${response.status}`,
      );
    }
  }
}
