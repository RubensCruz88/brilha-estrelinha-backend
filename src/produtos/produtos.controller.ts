import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { CriaProdutoDto } from './dto/criaProduto.dto.js';
import { AtualizaProdutoDto } from './dto/atualizaProduto.dto.js';
import { ProdutosService } from './produto.service.js';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly products: ProdutosService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.products.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.findOne(id);
  }

  @Post()
  create(@Body() dto: CriaProdutoDto) {
    return this.products.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizaProdutoDto) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.remove(id);
  }
}
