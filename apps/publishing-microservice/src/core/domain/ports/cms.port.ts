import { NewsArticle } from '@ai-news-aggregator/news-article';
import { Cms } from '../entities/cms';

export abstract class CmsPort {
  abstract publishArticle(article: NewsArticle, cms: Cms): Promise<void>;
}
