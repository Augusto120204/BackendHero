import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreatePlanDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    precio: number;

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    mesesPagar: number;
}