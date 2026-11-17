import { Logger } from '@nestjs/common';
import { Client } from 'pg';

export async function ensureDatabase(databaseUrl: string): Promise<void> {
  const logger = new Logger('Database');
  const url = new URL(databaseUrl);
  const dbName = decodeURIComponent(url.pathname.slice(1));

  // O nome vira identificador SQL (não aceita parâmetro): restringe a caracteres seguros
  if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
    logger.warn(`Nome de banco "${dbName}" fora do padrão; criação automática ignorada`);
    return;
  }

  url.pathname = '/postgres';                       // conecta no banco de manutenção
  const client = new Client({ connectionString: url.toString() });
  try {
    await client.connect();
    const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (exists.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      logger.log(`Banco de dados "${dbName}" criado`);
    }
  } catch (err) {
    logger.warn(`Não foi possível verificar/criar o banco "${dbName}": ${(err as Error).message}`);
  } finally {
    await client.end().catch(() => undefined);
  }
}