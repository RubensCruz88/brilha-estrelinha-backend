import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

/** Traduz erros conhecidos do Prisma (unicidade, constraints) em respostas HTTP. */
@Catch(Prisma.PrismaClientKnownRequestError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();

    if (exception.code === 'P2002') {
      const target = exception.meta?.target;
      const field = Array.isArray(target) ? target.join(', ') : typeof target === 'string' ? target : 'valor';
      return res.status(HttpStatus.CONFLICT).json({
        statusCode: 409,
        message: `Valor já cadastrado para o campo '${field}'`,
        error: 'Conflict',
      });
    }
    if (exception.code === 'P2025') {
      return res.status(HttpStatus.NOT_FOUND).json({ statusCode: 404, message: 'Registro não encontrado', error: 'Not Found' });
    }
    if (exception.code === 'P2011' || exception.code === 'P2004') {
      return res.status(HttpStatus.BAD_REQUEST).json({ statusCode: 400, message: 'Dados inválidos', error: 'Bad Request' });
    }
    console.error(exception);
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ statusCode: 500, message: 'Erro interno do servidor', error: 'Internal Server Error' });
  }
}
