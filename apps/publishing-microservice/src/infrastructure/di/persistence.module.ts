import { Module } from '@nestjs/common';
import {
  NewsArticleRepositoryPort,
  NewsArticleSupabaseClientProvider,
  SupabaseNewsArticleRepository,
} from '@ai-news-aggregator/news-article';
import { CmsRepositoryPort } from '../../core/domain/ports/cms-repository.port';
import { SupabaseCmsRepository } from '../adapters/persistence/supabase-cms.repository';
import { SupabaseClientProvider } from '../config/supabase-client.provider';

@Module({
  providers: [
    SupabaseClientProvider,
    {
      provide: NewsArticleSupabaseClientProvider,
      useExisting: SupabaseClientProvider,
    },
    {
      provide: NewsArticleRepositoryPort,
      useClass: SupabaseNewsArticleRepository,
    },
    {
      provide: CmsRepositoryPort,
      useClass: SupabaseCmsRepository,
    },
  ],
  exports: [NewsArticleRepositoryPort, CmsRepositoryPort],
})
export class PersistenceModule {}
