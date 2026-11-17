import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../usuarios/role.js';

export const ROLES_KEY = 'roles';
/** Restringe a rota aos papéis informados. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
