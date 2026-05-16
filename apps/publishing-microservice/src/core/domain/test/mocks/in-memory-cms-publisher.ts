import { NewsArticle } from '@ai-news-aggregator/news-article';
import { Cms } from '../../entities/cms';
import { CmsPort } from '../../ports/cms.port';

export class InMemoryCmsPublisher implements CmsPort {
  private error: Error | null = null;
  private errorsByCmsId: Map<string, Error> = new Map();
  private publishedArticles: Array<{ articleId: string; cmsId: string }> = [];

  setError(error: Error | null): void {
    this.error = error;
  }

  setErrorForCms(cmsId: string, error: Error): void {
    this.errorsByCmsId.set(cmsId, error);
  }

  getPublishedArticles(): Array<{ articleId: string; cmsId: string }> {
    return [...this.publishedArticles];
  }

  clear(): void {
    this.error = null;
    this.errorsByCmsId.clear();
    this.publishedArticles = [];
  }

  async publishArticle(article: NewsArticle, cms: Cms): Promise<void> {
    if (this.error) {
      throw this.error;
    }
    const errorForCms = this.errorsByCmsId.get(cms.id);
    if (errorForCms) {
      throw errorForCms;
    }

    this.publishedArticles.push({ articleId: article.id, cmsId: cms.id });
  }
}
