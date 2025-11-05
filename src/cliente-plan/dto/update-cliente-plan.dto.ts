import { PartialType } from "@nestjs/mapped-types";
import { CreateClientePlanDto } from "./create-cliente-plan.dto";
import { IsBoolean, IsDateString, IsInt, IsOptional } from "class-validator";

export class UpdateClientePlanDto extends  PartialType( CreateClientePlanDto) {
    @IsOptional()
    @IsInt()
    clienteId?: number;

    @IsOptional()
    @IsInt()
    planId?: number;

    @IsOptional()
    @IsDateString()
    fechaInicio?: string;

    @IsOptional()
    @IsDateString()
    fechaFin?: string;

    @IsOptional()
    @IsInt()
    diaPago?: number;

    @IsOptional()
    @IsBoolean()
    activado?: boolean;
}