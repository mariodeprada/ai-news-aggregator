import { getEnvironmentConfig } from './environment.config';

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const config = getEnvironmentConfig();

  return {
    url: config.supabaseUrl,
    serviceRoleKey: config.supabaseServiceRoleKey,
  };
}
