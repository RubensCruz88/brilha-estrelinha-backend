import { PartialType } from '@nestjs/mapped-types';
import { CriaProdutoDto } from './criaProduto.dto.js';

export class AtualizaProdutoDto extends PartialType(CriaProdutoDto) {}
