import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { isNotFoundError } from '../prisma/prisma-errors.js';
import { CriaUsuarioDto } from './dto/criaUsuario.dto.js';
import { AtualizaUsuarioDto } from './dto/atualizaUsuario.dto.js';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuario.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
  }

  async findOne(id: string) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  /** Usado no login: inclui o hash da senha, que é omitido nas demais consultas. */
  findByEmailWithPassword(email: string) {
    return this.prisma.usuario.findUnique({ where: { email }, omit: { hashSenha: false } });
  }

  async create(dto: CriaUsuarioDto) {
    const { senha, ...rest } = dto;
    return this.prisma.usuario.create({ data: { ...rest, hashSenha: await bcrypt.hash(senha, 10) } });
  }

  async update(id: string, dto: AtualizaUsuarioDto) {
    const { senha, ...rest } = dto;
    const data: Prisma.UsuarioUpdateInput = { ...rest };
    if (senha) data.hashSenha = await bcrypt.hash(senha, 10);
    if (Object.keys(data).length === 0) throw new BadRequestException('Nenhum campo para atualizar');

    try {
      return await this.prisma.usuario.update({ where: { id }, data });
    } catch (e) {
      if (isNotFoundError(e)) throw new NotFoundException('Usuário não encontrado');
      throw e;
    }
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) throw new BadRequestException('Você não pode excluir o próprio usuário');
    try {
      await this.prisma.usuario.delete({ where: { id } });
    } catch (e) {
      if (isNotFoundError(e)) throw new NotFoundException('Usuário não encontrado');
      throw e;
    }
  }

  countAdmins() {
    return this.prisma.usuario.count({ where: { papel: 'admin' } });
  }
}
