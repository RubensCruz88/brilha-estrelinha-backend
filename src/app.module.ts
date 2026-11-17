import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter.js';
import { validateEnv } from './config/env.validation.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { HealthController } from './health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProdutosModule } from './produtos/produtos.module.js';
import { SeedService } from './seed.service.js';
import { UsersModule } from './usuarios/usuarios.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv as any }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProdutosModule,
    ClientesModule,
  ],
  controllers: [HealthController],
  providers: [
    SeedService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: DatabaseExceptionFilter },
  ],
})
export class AppModule {}
