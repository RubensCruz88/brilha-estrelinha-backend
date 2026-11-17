import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CriaClienteDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  nome!: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MinLength(1)
  apelido?: string | null;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @Transform(trim)
  @IsString()
  @MinLength(10)
  @MaxLength(11)
  telefone!: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  endereco?: string | null;
}
