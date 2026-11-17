import { PartialType } from '@nestjs/mapped-types';
import { CriaClienteDto } from './criaCliente.dto.js';

export class AtualizaClienteDto extends PartialType(CriaClienteDto) {}
