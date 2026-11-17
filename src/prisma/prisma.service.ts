import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { ensureDatabase } from '../config/ensure-database.js';
import type { Env } from '../config/env.validation.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly url: string;

  constructor(config: ConfigService<Env, true>) {
    const url = config.get('DATABASE_URL', { infer: true });
    super({
      adapter: new PrismaPg({ connectionString: url }),
      // O hash da senha nunca sai nas consultas, a menos que seja pedido (omit: { passwordHash: false })
      omit: { usuario: { hashSenha: true } },
    });
    this.url = url;
  }

  async onModuleInit() {
    await ensureDatabase(this.url); // cria o banco se não existir
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
