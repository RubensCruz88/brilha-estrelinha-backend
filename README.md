# API — NestJS 12 + TypeScript + PostgreSQL + JWT

CRUD de **usuários**, **produtos** e **clientes** com autenticação JWT e controle de acesso por papel (`admin` / `user`).

**Stack:** NestJS 12 (ESM), TypeORM, PostgreSQL, Passport JWT, class-validator, bcryptjs, Vitest. Requer Node ≥ 22.13.

## Como rodar

```bash
docker compose up -d     # Postgres 16 em localhost:5432 (banco api_nest)
npm install
cp .env.example .env     # defina JWT_SECRET e DATABASE_URL
npm run start:dev        # desenvolvimento (watch)
npm run build && npm run start:prod   # produção
```

Se o banco do `DATABASE_URL` não existir, a API o cria ao iniciar (o usuário precisa da permissão `CREATEDB`; caso contrário, crie-o manualmente com `CREATE DATABASE api_nest;`).
Com `DB_SYNCHRONIZE=true` (padrão no `.env.example`) o TypeORM cria/ajusta as tabelas ao iniciar. **Em produção use `false` e migrations.**
Na primeira execução é criado um admin com `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Endpoints

| Método | Rota | Acesso |
|---|---|---|
| POST | `/auth/register` | público (cria usuário `user`) |
| POST | `/auth/login` | público → `{ token, user }` |
| GET | `/health` | público |
| GET | `/users/me` | autenticado |
| GET/POST | `/users` | admin |
| GET/PUT/DELETE | `/users/:id` | admin |
| GET/POST | `/products`, `/customers` | autenticado |
| GET/PUT/DELETE | `/products/:id`, `/customers/:id` | autenticado |

Envie o token em `Authorization: Bearer <token>`.

- Listagens de produtos e clientes: `?page=1&limit=20&search=texto` (limit máx. 100).
- `PUT` é parcial: só os campos enviados são alterados (`null` limpa campos opcionais).
- Erros: 400 (validação — `message` pode ser uma lista), 401, 403, 404, 409 (valor duplicado).

## Testes

```bash
# e2e: precisa de um Postgres de TESTE (cria registros)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/api_nest_test \
JWT_SECRET=teste ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=admin123 \
npm run test:e2e
```

## Estrutura

```
src/
  main.ts / app.module.ts / seed.service.ts
  config/            # validação das variáveis de ambiente
  common/            # decorators (@Public, @Roles, @CurrentUser), RolesGuard, filtro de erros do Postgres, paginação
  auth/              # login, registro, JwtStrategy, JwtAuthGuard (global)
  users/ products/ customers/   # entity + dto + service + controller + module
test/app.e2e-spec.ts
```

O `JwtAuthGuard` é global: toda rota exige token, exceto as marcadas com `@Public()`.
