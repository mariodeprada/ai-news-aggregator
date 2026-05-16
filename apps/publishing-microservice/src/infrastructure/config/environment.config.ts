import Joi from 'joi';

export interface PublishingEnvironmentConfig {
  port: number;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseNewsArticlesTable: string;
  supabaseCmsTable: string;
  publishArticlesSchedulerEnabled: boolean;
}

interface ValidatedEnvironment {
  PORT: number;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_NEWS_ARTICLES_TABLE: string;
  SUPABASE_CMS_TABLE: string;
  PUBLISH_ARTICLES_SCHEDULER_ENABLED: boolean;
}

const booleanSchema = Joi.boolean()
  .truthy('true')
  .truthy('1')
  .truthy('yes')
  .falsy('false')
  .falsy('0')
  .falsy('no');

const environmentSchema = Joi.object<ValidatedEnvironment>({
  PORT: Joi.number().integer().min(1).max(65535).default(3002),
  SUPABASE_URL: Joi.string().uri().allow('').default(''),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().allow('').default(''),
  SUPABASE_NEWS_ARTICLES_TABLE: Joi.string()
    .pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    .default('news_articles'),
  SUPABASE_CMS_TABLE: Joi.string()
    .pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    .default('cms'),
  PUBLISH_ARTICLES_SCHEDULER_ENABLED: booleanSchema.default(true),
}).unknown(true);

export function getEnvironmentConfig(): PublishingEnvironmentConfig {
  const { error, value } = environmentSchema.validate(process.env, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const details = error.details.map((detail) => detail.message).join('; ');
    throw new Error(`Invalid publishing environment configuration: ${details}`);
  }

  const env = value as ValidatedEnvironment;

  return {
    port: env.PORT,
    supabaseUrl: env.SUPABASE_URL,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseNewsArticlesTable: env.SUPABASE_NEWS_ARTICLES_TABLE,
    supabaseCmsTable: env.SUPABASE_CMS_TABLE,
    publishArticlesSchedulerEnabled: env.PUBLISH_ARTICLES_SCHEDULER_ENABLED,
  };
}

export function resetEnvironmentConfigForTest(): void {
  // Stable helper for tests.
}
