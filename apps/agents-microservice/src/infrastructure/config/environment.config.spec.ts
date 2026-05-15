import { getEnvironmentConfig } from './environment.config';

describe('agents environment config validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should provide defaults for agents configuration', () => {
    const config = getEnvironmentConfig();

    expect(config).toEqual({
      port: 3001,
      articleSummarizationSchedulerEnabled: true,
    });
  });

  it('should coerce numeric and boolean environment values', () => {
    process.env = {
      PORT: '3200',
      ARTICLE_SUMMARIZATION_SCHEDULER_ENABLED: 'false',
    };

    const config = getEnvironmentConfig();

    expect(config.port).toBe(3200);
    expect(config.articleSummarizationSchedulerEnabled).toBe(false);
  });

  it('should reject invalid environment values', () => {
    process.env = {
      PORT: 'not-a-port',
    };

    expect(() => getEnvironmentConfig()).toThrow(
      /Invalid agents environment configuration/,
    );
  });
});
