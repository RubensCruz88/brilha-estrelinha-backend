import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Libera a rota da autenticação JWT (o guard é global). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
