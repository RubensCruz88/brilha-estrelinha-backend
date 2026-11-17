import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PaginationQueryDto, paginated } from '../common/dto/pagination-query.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { isNotFoundError } from '../prisma/prisma-errors.js';
import { CriaClienteDto } from './dto/criaCliente.dto.js';
import { AtualizaClienteDto } from './dto/atualizaCliente.dto.js';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ page, limit, search }: PaginationQueryDto) {
    const contains = (field: keyof Prisma.ClienteWhereInput) => ({ [field]: { contains: search, mode: 'insensitive' } });
    const where: Prisma.ClienteWhereInput | undefined = search
      ? { OR: [contains('nome'), contains('apelido'), contains('email'), contains('telefone')] }
      : undefined;
    const [rows, total] = await Promise.all([
      this.prisma.cliente.findMany({ where, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: limit, skip: (page - 1) * limit }),
      this.prisma.cliente.count({ where }),
    ]);
    return paginated(rows, total, page, limit);
  }

  async findOne(id: string) {
    const customer = await this.prisma.cliente.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Registro não encontrado');
    return customer;
  }

  create(dto: CriaClienteDto) {
    return this.prisma.cliente.create({ data: dto });
  }

  async update(id: string, dto: AtualizaClienteDto) {
    if (Object.keys(dto).length === 0) throw new BadRequestException('Nenhum campo para atualizar');
    try {
      return await this.prisma.cliente.update({ where: { id }, data: dto });
    } catch (e) {
      if (isNotFoundError(e)) throw new NotFoundException('Registro não encontrado');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.cliente.delete({ where: { id } });
    } catch (e) {
      if (isNotFoundError(e)) throw new NotFoundException('Registro não encontrado');
      throw e;
    }
  }
}
