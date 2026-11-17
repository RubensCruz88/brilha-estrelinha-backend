import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { Usuario } from '../generated/prisma/client.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsuariosService,
    private readonly jwt: JwtService,
  ) {}

  /** Auto-cadastro: sempre cria usuário com papel "user". */
  async register(dto: RegisterDto) {
    const user = await this.users.create({ nome: dto.nome, email: dto.email, senha: dto.senha, papel: 'user' });
    return this.session(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmailWithPassword(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.hashSenha))) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }
    return this.session(user);
  }

  private async session(user: Pick<Usuario, 'id' | 'nome' | 'email' | 'papel'>) {
    const token = await this.jwt.signAsync({ role: user.papel }, { subject: user.id });
    return { token, user: { id: user.id, name: user.nome, email: user.email, role: user.papel } };
  }
}
