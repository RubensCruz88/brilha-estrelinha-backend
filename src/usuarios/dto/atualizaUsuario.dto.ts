import { PartialType } from '@nestjs/mapped-types';
import { CriaUsuarioDto } from './criaUsuario.dto.js';

export class AtualizaUsuarioDto extends PartialType(CriaUsuarioDto) {}
