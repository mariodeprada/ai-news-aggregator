import { getEnvironmentConfig } from './environment.config';

export interface EmailConfig {
  to: string;
  from: string;
  reviewBaseUrl: string;
  jwtSecret: string;
  jwtTtlSeconds: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpSecure: boolean;
}

export function getEmailConfig(): EmailConfig {
  const config = getEnvironmentConfig();

  return {
    to: config.notificationEmailTo,
    from: config.notificationEmailFrom,
    reviewBaseUrl: config.notificationReviewBaseUrl,
    jwtSecret: config.notificationJwtSecret,
    jwtTtlSeconds: config.notificationJwtTtlSeconds,
    smtpHost: config.smtpHost,
    smtpPort: config.smtpPort,
    smtpUser: config.smtpUser,
    smtpPass: config.smtpPass,
    smtpSecure: config.smtpSecure,
  };
}
