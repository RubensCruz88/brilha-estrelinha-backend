import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator.js';

/** Guard global: exige JWT em todas as rotas, exceto as marcadas com @Public(). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    return isPublic ? true : super.canActivate(context);
  }

  handleRequest<T>(err: unknown, user: T, info?: { name?: string }) {
    if (err || !user) {
      throw new UnauthorizedException(info?.name === 'JsonWebTokenError' || info?.name === 'TokenExpiredError' ? 'Token inválido ou expirado' : 'Token não informado');
    }
    return user;
  }
}
