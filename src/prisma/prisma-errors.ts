import { Prisma } from '../generated/prisma/client.js';

/** Registro não encontrado em update/delete (P2025). */
export const isNotFoundError = (e: unknown): boolean =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025';
