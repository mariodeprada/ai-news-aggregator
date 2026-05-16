import { getEnvironmentConfig } from './environment.config';

export interface SchedulingConfig {
  publishArticlesSchedulerEnabled: boolean;
}

export function getSchedulingConfig(): SchedulingConfig {
  const config = getEnvironmentConfig();

  return {
    publishArticlesSchedulerEnabled: config.publishArticlesSchedulerEnabled,
  };
}
