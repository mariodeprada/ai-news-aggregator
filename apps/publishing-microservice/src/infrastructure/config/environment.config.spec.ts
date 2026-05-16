import {
  getEnvironmentConfig,
  resetEnvironmentConfigForTest,
} from './environment.config';

describe('getEnvironmentConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.PORT;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_NEWS_ARTICLES_TABLE;
    delete process.env.SUPABASE_CMS_TABLE;
    delete process.env.PUBLISH_ARTICLES_SCHEDULER_ENABLED;
    resetEnvironmentConfigForTest();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should provide defaults for publishing configuration', () => {
    const config = getEnvironmentConfig();

    expect(config.port).toBe(3002);
    expect(config.supabaseNewsArticlesTable).toBe('news_articles');
    expect(config.supabaseCmsTable).toBe('cms');
    expect(config.publishArticlesSchedulerEnabled).toBe(true);
  });

  it('should coerce scheduler environment values', () => {
    process.env.PUBLISH_ARTICLES_SCHEDULER_ENABLED = 'false';

    const config = getEnvironmentConfig();

    expect(config.publishArticlesSchedulerEnabled).toBe(false);
  });
});
