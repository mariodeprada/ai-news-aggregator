import { WordpressCms } from '../../domain/entities/cms';
import { InMemoryCmsRepository } from '../../domain/test/mocks/in-memory-cms.repository';
import { GetCmsToPublishUseCase } from '../use-cases/get-cms-to-publish.use-case';

describe('GetCmsToPublishUseCase', () => {
  let cmsRepository: InMemoryCmsRepository;
  let useCase: GetCmsToPublishUseCase;

  beforeEach(() => {
    cmsRepository = new InMemoryCmsRepository();
    useCase = new GetCmsToPublishUseCase(cmsRepository);
  });

  it('should return due active cms configurations', async () => {
    await cmsRepository.save(
      new WordpressCms(
        'cms-1',
        new Date('2024-01-01T00:00:00Z'),
        true,
        'https://example.com',
        'editor',
        'wordpress-main',
      ),
    );

    const result = await useCase.execute(new Date('2024-01-01T01:00:00Z'));

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('cms-1');
  });
});
