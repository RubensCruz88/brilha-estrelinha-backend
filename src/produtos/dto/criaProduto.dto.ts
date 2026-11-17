import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CriaProdutoDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  nome!: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  descricao?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorUnitario?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  estoque?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  estoqueMinimo?: number;
}
