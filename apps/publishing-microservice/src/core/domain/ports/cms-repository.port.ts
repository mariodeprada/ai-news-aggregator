import { Cms } from '../entities/cms';

export abstract class CmsRepositoryPort {
  abstract findDueCms(now: Date): Promise<Cms[]>;
  abstract updateLastPublishedAt(id: string, timestamp: Date): Promise<void>;
  abstract findById(id: string): Promise<Cms | null>;
}
