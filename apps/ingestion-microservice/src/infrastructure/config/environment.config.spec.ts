import { getEnvironmentConfig } from './environment.config';

describe('environment config validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should provide defaults for optional ingestion configuration', () => {
    const config = getEnvironmentConfig();

    expect(config).toMatchObject({
      port: 3000,
      supabaseUrl: '',
      supabaseServiceRoleKey: '',
      supabaseNewsArticlesTable: 'news_articles',
      supabasePullSourcesTable: 'pull_sources',
      notificationEmailTo: '',
      notificationEmailFrom: '',
      notificationReviewBaseUrl: '',
      notificationJwtSecret: '',
      notificationJwtTtlSeconds: 86400,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      smtpSecure: false,
      pullSourcesPollIntervalMs: 300000,
      pullSourcesSchedulerEnabled: true,
      approvalNotificationSchedulerEnabled: true,
    });
  });

  it('should coerce numeric and boolean environment values', () => {
    process.env = {
      PORT: '3100',
      NOTIFICATION_JWT_TTL_SECONDS: '7200',
      SMTP_PORT: '2525',
      SMTP_SECURE: 'true',
      PULL_SOURCES_POLL_INTERVAL_MS: '2000',
      PULL_SOURCES_SCHEDULER_ENABLED: '0',
      APPROVAL_NOTIFICATION_SCHEDULER_ENABLED: 'yes',
    };

    const config = getEnvironmentConfig();

    expect(config.port).toBe(3100);
    expect(config.notificationJwtTtlSeconds).toBe(7200);
    expect(config.smtpPort).toBe(2525);
    expect(config.smtpSecure).toBe(true);
    expect(config.pullSourcesPollIntervalMs).toBe(2000);
    expect(config.pullSourcesSchedulerEnabled).toBe(false);
    expect(config.approvalNotificationSchedulerEnabled).toBe(true);
  });

  it('should reject invalid environment values', () => {
    process.env = {
      PORT: 'not-a-port',
      SUPABASE_URL: 'not-a-url',
    };

    expect(() => getEnvironmentConfig()).toThrow(
      /Invalid ingestion environment configuration/,
    );
  });
});
