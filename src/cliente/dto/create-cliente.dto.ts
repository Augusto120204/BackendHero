import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateClienteDto {
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    usuarioId: number;

    @IsNotEmpty()
    @IsString()
    horario: string;

    @IsNotEmpty()
    @IsString()
    sexo: string;

    @IsOptional()
    @IsString()
    observaciones?: string;

    @IsNotEmpty()
    @IsString()
    objetivos: string;

    @IsNotEmpty()
    @IsInt()
    tiempoEntrenar: number;
}