import Joi from 'joi';

export interface IngestionEnvironmentConfig {
  port: number;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseNewsArticlesTable: string;
  supabasePullSourcesTable: string;
  notificationEmailTo: string;
  notificationEmailFrom: string;
  notificationReviewBaseUrl: string;
  notificationJwtSecret: string;
  notificationJwtTtlSeconds: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpSecure: boolean;
  pullSourcesPollIntervalMs: number;
  pullSourcesSchedulerEnabled: boolean;
  approvalNotificationSchedulerEnabled: boolean;
}

interface ValidatedEnvironment {
  PORT: number;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_NEWS_ARTICLES_TABLE: string;
  SUPABASE_PULL_SOURCES_TABLE: string;
  NOTIFICATION_EMAIL_TO: string;
  NOTIFICATION_EMAIL_FROM: string;
  NOTIFICATION_REVIEW_BASE_URL: string;
  NOTIFICATION_JWT_SECRET: string;
  NOTIFICATION_JWT_TTL_SECONDS: number;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_SECURE: boolean;
  PULL_SOURCES_POLL_INTERVAL_MS: number;
  PULL_SOURCES_SCHEDULER_ENABLED: boolean;
  APPROVAL_NOTIFICATION_SCHEDULER_ENABLED: boolean;
}

const booleanSchema = Joi.boolean()
  .truthy('true')
  .truthy('1')
  .truthy('yes')
  .falsy('false')
  .falsy('0')
  .falsy('no');

const environmentSchema = Joi.object<ValidatedEnvironment>({
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  SUPABASE_URL: Joi.string().uri().allow('').default(''),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().allow('').default(''),
  SUPABASE_NEWS_ARTICLES_TABLE: Joi.string()
    .pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    .default('news_articles'),
  SUPABASE_PULL_SOURCES_TABLE: Joi.string()
    .pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    .default('pull_sources'),
  NOTIFICATION_EMAIL_TO: Joi.string().email({ tlds: false }).allow('').default(''),
  NOTIFICATION_EMAIL_FROM: Joi.string().email({ tlds: false }).allow('').default(''),
  NOTIFICATION_REVIEW_BASE_URL: Joi.string().uri({ scheme: ['http', 'https'] }).allow('').default(''),
  NOTIFICATION_JWT_SECRET: Joi.string().allow('').default(''),
  NOTIFICATION_JWT_TTL_SECONDS: Joi.number().integer().min(60).default(86400),
  SMTP_HOST: Joi.string().allow('').default(''),
  SMTP_PORT: Joi.number().integer().min(1).max(65535).default(587),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASS: Joi.string().allow('').default(''),
  SMTP_SECURE: booleanSchema.default(false),
  PULL_SOURCES_POLL_INTERVAL_MS: Joi.number().integer().min(1).default(300000),
  PULL_SOURCES_SCHEDULER_ENABLED: booleanSchema.default(true),
  APPROVAL_NOTIFICATION_SCHEDULER_ENABLED: booleanSchema.default(true),
}).unknown(true);

export function getEnvironmentConfig(): IngestionEnvironmentConfig {
  const { error, value } = environmentSchema.validate(process.env, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const details = error.details.map((detail) => detail.message).join('; ');
    throw new Error(`Invalid ingestion environment configuration: ${details}`);
  }

  const env = value as ValidatedEnvironment;

  return {
    port: env.PORT,
    supabaseUrl: env.SUPABASE_URL,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseNewsArticlesTable: env.SUPABASE_NEWS_ARTICLES_TABLE,
    supabasePullSourcesTable: env.SUPABASE_PULL_SOURCES_TABLE,
    notificationEmailTo: env.NOTIFICATION_EMAIL_TO,
    notificationEmailFrom: env.NOTIFICATION_EMAIL_FROM,
    notificationReviewBaseUrl: env.NOTIFICATION_REVIEW_BASE_URL,
    notificationJwtSecret: env.NOTIFICATION_JWT_SECRET,
    notificationJwtTtlSeconds: env.NOTIFICATION_JWT_TTL_SECONDS,
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT,
    smtpUser: env.SMTP_USER,
    smtpPass: env.SMTP_PASS,
    smtpSecure: env.SMTP_SECURE,
    pullSourcesPollIntervalMs: env.PULL_SOURCES_POLL_INTERVAL_MS,
    pullSourcesSchedulerEnabled: env.PULL_SOURCES_SCHEDULER_ENABLED,
    approvalNotificationSchedulerEnabled: env.APPROVAL_NOTIFICATION_SCHEDULER_ENABLED,
  };
}

export function resetEnvironmentConfigForTest(): void {
  // Kept as a stable test helper for modules that reset config state.
}
