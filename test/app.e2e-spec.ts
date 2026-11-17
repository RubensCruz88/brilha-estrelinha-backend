import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

// Requer um Postgres acessível em DATABASE_URL (use um banco de teste, não o de desenvolvimento).
describe('API (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<INestApplication['getHttpServer']>;
  let admin = '';
  const suffix = Date.now();

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { exposeUnsetFields: false } }));
    await app.init();
    http = app.getHttpServer();
    const res = await request(http)
      .post('/auth/login')
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    admin = res.body.token;
  });

  afterAll(() => app.close());

  const auth = (t = admin) => ({ Authorization: `Bearer ${t}` });

  it('exige token nas rotas protegidas', async () => {
    await request(http).get('/products').expect(401);
    await request(http).get('/products').set(auth('invalido')).expect(401);
  });

  it('recusa login com senha errada', () => request(http).post('/auth/login').send({ email: process.env.ADMIN_EMAIL, password: 'x' }).expect(401));

  it('usuário comum não acessa /users, mas acessa /users/me', async () => {
    const reg = await request(http).post('/auth/register').send({ name: 'Ana', email: `ana${suffix}@x.com`, password: '123456' }).expect(201);
    const t = reg.body.token;
    expect(reg.body.user.role).toBe('user');
    await request(http).get('/users').set(auth(t)).expect(403);
    const me = await request(http).get('/users/me').set(auth(t)).expect(200);
    expect(me.body.passwordHash).toBeUndefined();
  });

  it('e-mail duplicado retorna 409', async () => {
    const body = { name: 'Dup', email: `dup${suffix}@x.com`, password: '123456' };
    await request(http).post('/auth/register').send(body).expect(201);
    await request(http).post('/auth/register').send(body).expect(409);
  });

  it('CRUD de produtos com PUT parcial', async () => {
    const created = await request(http).post('/products').set(auth()).send({ name: 'Café', sku: `S${suffix}`, price: 19.9, stock: 10 }).expect(201);
    const id = created.body.id;
    expect(created.body.price).toBe(19.9);

    const updated = await request(http).put(`/products/${id}`).set(auth()).send({ price: 25 }).expect(200);
    expect(updated.body.price).toBe(25);
    expect(updated.body.stock).toBe(10); // não alterado

    const list = await request(http).get(`/products?search=S${suffix}`).set(auth()).expect(200);
    expect(list.body.total).toBe(1);

    await request(http).post('/products').set(auth()).send({ name: '', price: -1 }).expect(400);
    await request(http).delete(`/products/${id}`).set(auth()).expect(204);
    await request(http).get(`/products/${id}`).set(auth()).expect(404);
  });

  it('CRUD de clientes', async () => {
    const created = await request(http).post('/customers').set(auth()).send({ name: 'João', email: `j${suffix}@x.com` }).expect(201);
    const id = created.body.id;
    const upd = await request(http).put(`/customers/${id}`).set(auth()).send({ phone: '3199' }).expect(200);
    expect(upd.body.phone).toBe('3199');
    await request(http).delete(`/customers/${id}`).set(auth()).expect(204);
  });
});
