import { getEnvironmentConfig } from './environment.config';

export interface SchedulingConfig {
  articleSummarizationSchedulerEnabled: boolean;
}

export function getSchedulingConfig(): SchedulingConfig {
  const config = getEnvironmentConfig();

  return {
    articleSummarizationSchedulerEnabled:
      config.articleSummarizationSchedulerEnabled,
  };
}
