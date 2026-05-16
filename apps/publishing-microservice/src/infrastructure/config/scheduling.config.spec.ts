import { getSchedulingConfig } from './scheduling.config';

describe('getSchedulingConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.PUBLISH_ARTICLES_SCHEDULER_ENABLED;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should expose publish scheduler config', () => {
    process.env.PUBLISH_ARTICLES_SCHEDULER_ENABLED = 'false';

    const config = getSchedulingConfig();

    expect(config.publishArticlesSchedulerEnabled).toBe(false);
  });
});
