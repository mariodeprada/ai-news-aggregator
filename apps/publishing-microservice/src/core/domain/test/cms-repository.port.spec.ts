import { WordpressCms } from '../entities/cms';
import { InMemoryCmsRepository } from './mocks/in-memory-cms.repository';

describe('CmsRepositoryPort', () => {
  let repository: InMemoryCmsRepository;
  let cms: WordpressCms;

  beforeEach(() => {
    repository = new InMemoryCmsRepository();
    cms = new WordpressCms(
      'cms-123',
      new Date('2024-01-01T00:00:00Z'),
      true,
      'https://example.com',
      'editor',
      'wordpress-main',
    );
  });

  describe('findDueCms', () => {
    it('should return cms that are due for publishing', async () => {
      await repository.save(cms);

      const dueCms = await repository.findDueCms(
        new Date('2024-01-01T01:00:00Z'),
      );

      expect(dueCms).toHaveLength(1);
      expect(dueCms[0].id).toBe('cms-123');
    });
  });

  describe('findById', () => {
    it('should return null when cms id does not exist', async () => {
      const found = await repository.findById('nonexistent-id');

      expect(found).toBeNull();
    });
  });

  describe('updateLastPublishedAt', () => {
    it('should update the last published timestamp for a cms', async () => {
      await repository.save(cms);

      const newTimestamp = new Date('2024-01-01T02:00:00Z');
      await repository.updateLastPublishedAt(cms.id, newTimestamp);

      const found = await repository.findById(cms.id);
      expect(found?.lastPublishedAt).toEqual(newTimestamp);
    });

    it('should throw error when cms does not exist', async () => {
      await expect(
        repository.updateLastPublishedAt('nonexistent-id', new Date()),
      ).rejects.toThrow('CMS not found');
    });
  });
});
