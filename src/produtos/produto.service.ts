import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Produto } from '../generated/prisma/client.js';
import { PaginationQueryDto, paginated } from '../common/dto/pagination-query.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { isNotFoundError } from '../prisma/prisma-errors.js';
import { CriaProdutoDto } from './dto/criaProduto.dto.js';
import { AtualizaProdutoDto } from './dto/atualizaProduto.dto.js';

// NUMERIC do Postgres vira Decimal no Prisma; a API continua expondo number
const toResponse = (p: Produto) => ({ ...p, precoUnitario: Number(p.precoUnitario) });

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ page, limit, search }: PaginationQueryDto) {
    const contains = (field: keyof Prisma.ProdutoWhereInput) => ({ [field]: { contains: search, mode: 'insensitive' } });
    const where: Prisma.ProdutoWhereInput | undefined = search
      ? { OR: [contains('nome'), contains('descricao')] }
      : undefined;
    const [rows, total] = await Promise.all([
      this.prisma.produto.findMany({ where, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: limit, skip: (page - 1) * limit }),
      this.prisma.produto.count({ where }),
    ]);
    return paginated(rows.map(toResponse), total, page, limit);
  }

  async findOne(id: string) {
    const product = await this.prisma.produto.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Registro não encontrado');
    return toResponse(product);
  }

  async create(dto: CriaProdutoDto) {
    return toResponse(await this.prisma.produto.create({ data: dto }));
  }

  async update(id: string, dto: AtualizaProdutoDto) {
    if (Object.keys(dto).length === 0) throw new BadRequestException('Nenhum campo para atualizar');
    try {
      return toResponse(await this.prisma.produto.update({ where: { id }, data: dto }));
    } catch (e) {
      if (isNotFoundError(e)) throw new NotFoundException('Registro não encontrado');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.produto.delete({ where: { id } });
    } catch (e) {
      if (isNotFoundError(e)) throw new NotFoundException('Registro não encontrado');
      throw e;
    }
  }
}
