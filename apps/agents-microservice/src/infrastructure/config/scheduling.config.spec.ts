import { getSchedulingConfig } from './scheduling.config';

describe('agents scheduling config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should provide defaults for scheduling configuration', () => {
    expect(getSchedulingConfig()).toEqual({
      articleSummarizationSchedulerEnabled: true,
    });
  });

  it('should read article summarization scheduler flag from environment', () => {
    process.env = {
      ARTICLE_SUMMARIZATION_SCHEDULER_ENABLED: 'false',
    };

    expect(getSchedulingConfig()).toEqual({
      articleSummarizationSchedulerEnabled: false,
    });
  });
});
