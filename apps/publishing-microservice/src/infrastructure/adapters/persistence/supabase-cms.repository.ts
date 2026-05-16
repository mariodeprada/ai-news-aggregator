import { Injectable, Logger } from '@nestjs/common';
import { CmsRepositoryPort } from '../../../core/domain/ports/cms-repository.port';
import { Cms, WordpressCms } from '../../../core/domain/entities/cms';
import { SupabaseClientProvider } from '../../config/supabase-client.provider';

interface CmsDbRecord {
  id: string;
  type: 'wordpress';
  base_url: string;
  username: string;
  credentials_ref: string;
  last_published_at: string | null;
  is_active: boolean;
}

@Injectable()
export class SupabaseCmsRepository implements CmsRepositoryPort {
  private readonly logger = new Logger(SupabaseCmsRepository.name);

  constructor(private readonly supabaseClient: SupabaseClientProvider) {}

  async findDueCms(now: Date): Promise<Cms[]> {
    const client = this.supabaseClient.getClient();
    const table = this.supabaseClient.getCmsTable();

    const { data, error } = await client
      .from(table)
      .select('*')
      .eq('is_active', true)
      .or(`last_published_at.is.null,last_published_at.lt.${now.toISOString()}`);

    if (error) {
      this.logger.error(`Failed to find due cms: ${error.message}`);
      throw error;
    }

    return (data as CmsDbRecord[]).map((record) => this.mapToDomain(record));
  }

  async updateLastPublishedAt(id: string, timestamp: Date): Promise<void> {
    const client = this.supabaseClient.getClient();
    const table = this.supabaseClient.getCmsTable();

    const { error } = await client
      .from(table)
      .update({ last_published_at: timestamp.toISOString() })
      .eq('id', id);

    if (error) {
      this.logger.error(
        `Failed to update last_published_at for cms ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<Cms | null> {
    const client = this.supabaseClient.getClient();
    const table = this.supabaseClient.getCmsTable();

    const { data, error } = await client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToDomain(data as CmsDbRecord);
  }

  private mapToDomain(record: CmsDbRecord): Cms {
    return new WordpressCms(
      record.id,
      record.last_published_at ? new Date(record.last_published_at) : null,
      record.is_active,
      record.base_url,
      record.username,
      record.credentials_ref,
    );
  }
}
