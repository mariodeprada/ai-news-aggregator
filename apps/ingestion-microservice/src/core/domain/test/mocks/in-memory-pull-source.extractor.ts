import { PullSourceExtractorPort, ExtractedArticleData } from '../../ports/pull-source-extractor.port';
import { PullSource } from '../../entities/pull-source';

export class InMemoryPullSourceExtractor implements PullSourceExtractorPort {
  private articlesToReturn: ExtractedArticleData[] = [];
  private shouldThrowError: boolean = false;
  private errorMessage: string = '';
  private errorsBySourceId: Map<string, string> = new Map();

  setArticlesToReturn(articles: ExtractedArticleData[]) {
    this.articlesToReturn = articles;
  }

  setError(message: string) {
    this.shouldThrowError = true;
    this.errorMessage = message;
  }

  setErrorForSource(sourceId: string, message: string) {
    this.errorsBySourceId.set(sourceId, message);
  }

  clearError() {
    this.shouldThrowError = false;
    this.errorMessage = '';
    this.errorsBySourceId.clear();
  }

  clear() {
    this.articlesToReturn = [];
    this.shouldThrowError = false;
    this.errorMessage = '';
    this.errorsBySourceId.clear();
  }

  async extract(source: PullSource, lastPolledAt?: Date): Promise<ExtractedArticleData[]> {
    const sourceError = this.errorsBySourceId.get(source.id);
    if (sourceError) {
      throw new Error(sourceError);
    }
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }
    
    if (lastPolledAt) {
      return this.articlesToReturn.filter(article => article.createdAt > lastPolledAt);
    }
    
    return this.articlesToReturn;
  }
}
