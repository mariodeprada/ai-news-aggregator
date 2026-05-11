import * as cheerio from 'cheerio';
import { Injectable, Logger } from '@nestjs/common';
import { PullSourceExtractorPort, ExtractedArticleData } from '@ai-news-aggregator/ingestion-microservice/core/domain/ports/pull-source-extractor.port';
import { PullSource, HtmlPullSource } from '@ai-news-aggregator/ingestion-microservice/core/domain/entities/pull-source';

@Injectable()
export class HtmlPullSourceExtractor implements PullSourceExtractorPort {
  private readonly logger = new Logger(HtmlPullSourceExtractor.name);

  async extract(source: PullSource, lastPolledAt?: Date): Promise<ExtractedArticleData[]> {
    if (!(source instanceof HtmlPullSource)) {
      throw new Error(`HtmlPullSourceExtractor can only extract HtmlPullSource, got ${source.constructor.name}`);
    }

    const sourceUrl = source.sourceUrl;
    const classIdentifiers = source.classIdentifiers;
    const lastPolledDate = lastPolledAt ?? source.lastPolledAt;
    
    this.logger.debug(`Extracting HTML from: ${sourceUrl} (source: ${source.id}, lastPolledAt: ${lastPolledDate?.toISOString() ?? 'null'})`);
    
    try {
      const response = await fetch(sourceUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'AI News Aggregator/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const html = await response.text();
      this.logger.debug(`Received HTML, parsing with selectors...`);
      
      const articles = this.parseHtml(html, classIdentifiers, lastPolledDate);
      this.logger.log(`Extracted ${articles.length} articles from HTML (source: ${source.id})`);
      
      return articles;
    } catch (error) {
      const errorObj = error as Error;
      this.logger.error(`Failed to extract HTML: ${errorObj.message}`);
      throw error;
    }
  }

  private parseHtml(html: string, classIdentifiers: Record<string, string>, lastPolledAt?: Date): ExtractedArticleData[] {
    const articles: ExtractedArticleData[] = [];
    const lastPolledTimestamp = lastPolledAt?.getTime() ?? 0;
    
    this.logger.debug(`Filtering articles newer than: ${lastPolledAt?.toISOString() ?? 'beginning of time'}`);
    
    const $ = cheerio.load(html);
    const titleSelector = classIdentifiers.title;
    
    this.logger.debug(`Using title selector: ${titleSelector}`);
    
    const titleElements = $(titleSelector);
    
    if (titleElements.length === 0) {
      this.logger.warn(`No elements found for selector: ${titleSelector}`);
      return articles;
    }

    let filteredCount = 0;

    titleElements.each((_, element) => {
      try {
        const $title = $(element);
        const title = $title.text().trim();
        
        if (!title) {
          this.logger.debug('Skipping item - empty title');
          return;
        }

        const $article = $title.closest('article, div, li, section') || $title.parent();
        
        const content = classIdentifiers.content ? $article.find(classIdentifiers.content).first().text().trim() : '';
        const mainImageUrl = classIdentifiers.mainImageUrl ? $article.find(classIdentifiers.mainImageUrl).first().attr('src') || $article.find(classIdentifiers.mainImageUrl).first().attr('data-src') || '' : '';
        const originalAuthor = classIdentifiers.originalAuthor ? $article.find(classIdentifiers.originalAuthor).first().text().trim() : '';
        const createdAtString = classIdentifiers.createdAt ? $article.find(classIdentifiers.createdAt).first().text().trim() : '';
        
        const createdAt = createdAtString ? new Date(createdAtString) : new Date();
        
        if (lastPolledAt && createdAt.getTime() <= lastPolledTimestamp) {
          this.logger.debug(`Skipping article "${title}" - published at ${createdAt.toISOString()} (before lastPolledAt: ${lastPolledAt.toISOString()})`);
          filteredCount++;
          return;
        }

        const articleUrl = $title.find('a').first().attr('href') || $title.parent('a').attr('href') || '';
        
        if (!articleUrl) {
          this.logger.debug('Skipping item - no URL found');
          return;
        }

        articles.push({
          articleUrl,
          title,
          content,
          mainImageUrl,
          originalAuthor: originalAuthor || 'Unknown',
          createdAt,
        });
      } catch (error) {
        this.logger.warn(`Failed to parse HTML item: ${(error as Error).message}`);
      }
    });

    if (filteredCount > 0) {
      this.logger.debug(`Filtered out ${filteredCount} articles older than lastPolledAt`);
    }

    return articles;
  }
}
