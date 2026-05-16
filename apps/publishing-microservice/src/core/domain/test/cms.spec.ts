import { ArgumentError } from '../errors/argument.error';
import { WordpressCms } from '../entities/cms';

describe('WordpressCms', () => {
  it('should create a wordpress cms instance with correct properties', () => {
    const cms = new WordpressCms(
      'cms-1',
      new Date('2024-01-01T00:00:00Z'),
      true,
      'https://example.com',
      'editor',
      'wordpress-main',
    );

    expect(cms.id).toBe('cms-1');
    expect(cms.baseUrl).toBe('https://example.com');
    expect(cms.username).toBe('editor');
    expect(cms.credentialsRef).toBe('wordpress-main');
  });

  it('should reject empty baseUrl', () => {
    expect(
      () =>
        new WordpressCms(
          'cms-1',
          null,
          true,
          '',
          'editor',
          'wordpress-main',
        ),
    ).toThrow(new ArgumentError('WordpressCms baseUrl cannot be empty'));
  });
});
