import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './config/env.validation.js';
import { UsuariosService } from './usuarios/usuarios.service.js';

/** Cria o administrador inicial caso ainda não exista nenhum. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly users: UsuariosService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async onApplicationBootstrap() {
    const email = this.config.get('ADMIN_EMAIL', { infer: true });
    const senha = this.config.get('ADMIN_PASSWORD', { infer: true });
    if (!email || !senha) return;
    if ((await this.users.countAdmins()) > 0) return;

    await this.users.create({ nome: this.config.get('ADMIN_NAME', { infer: true }), email: email.toLowerCase(), senha, papel: 'admin' });
    this.logger.log(`Administrador inicial criado: ${email}`);
  }
}
