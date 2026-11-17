export interface Env {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string[];
  ADMIN_NAME: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
}

/** Valida e normaliza as variáveis de ambiente na inicialização. */
export function validateEnv(raw: Record<string, unknown>): Env {
  const need = (key: string): string => {
    const v = raw[key];
    if (typeof v !== 'string' || v === '') throw new Error(`Variável de ambiente ${key} não definida`);
    return v;
  };
  const opt = (key: string): string | undefined => (typeof raw[key] === 'string' && raw[key] ? (raw[key] as string) : undefined);

  return {
    PORT: Number(opt('PORT') ?? 3000),
    DATABASE_URL: need('DATABASE_URL'),
    JWT_SECRET: need('JWT_SECRET'),
    JWT_EXPIRES_IN: opt('JWT_EXPIRES_IN') ?? '1h',
    CORS_ORIGIN: (opt('CORS_ORIGIN') ?? 'http://localhost:3001').split(','),
    ADMIN_NAME: opt('ADMIN_NAME') ?? 'Administrador',
    ADMIN_EMAIL: opt('ADMIN_EMAIL'),
    ADMIN_PASSWORD: opt('ADMIN_PASSWORD'),
  };
}
