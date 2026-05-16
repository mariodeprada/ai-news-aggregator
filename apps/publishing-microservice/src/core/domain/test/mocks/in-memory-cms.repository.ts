import { Cms, WordpressCms } from '../../entities/cms';
import { CmsRepositoryPort } from '../../ports/cms-repository.port';

export class InMemoryCmsRepository implements CmsRepositoryPort {
  private cmsById: Map<string, Cms> = new Map();

  async save(cms: Cms): Promise<Cms> {
    this.cmsById.set(cms.id, cms);
    return cms;
  }

  async findById(id: string): Promise<Cms | null> {
    return this.cmsById.get(id) ?? null;
  }

  async findDueCms(now: Date): Promise<Cms[]> {
    const dueCms: Cms[] = [];

    for (const cms of this.cmsById.values()) {
      if (!cms.isActive) {
        continue;
      }

      if (cms.lastPublishedAt === null) {
        dueCms.push(cms);
        continue;
      }

      const millisecondsSinceLastPublication =
        now.getTime() - cms.lastPublishedAt.getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (millisecondsSinceLastPublication >= fiveMinutes) {
        dueCms.push(cms);
      }
    }

    return dueCms;
  }

  async updateLastPublishedAt(id: string, timestamp: Date): Promise<void> {
    const cms = this.cmsById.get(id);

    if (!cms) {
      throw new Error('CMS not found');
    }

    if (cms instanceof WordpressCms) {
      this.cmsById.set(
        id,
        new WordpressCms(
          cms.id,
          timestamp,
          cms.isActive,
          cms.baseUrl,
          cms.username,
          cms.credentialsRef,
        ),
      );
    }
  }

  clear(): void {
    this.cmsById.clear();
  }
}
