import { SetMetadata } from "@nestjs/common";
export enum Role {
  ADMIN = 'ADMIN',
  RECEPCIONISTA = 'RECEPCIONISTA',
  ENTRENADOR = 'ENTRENADOR',
  CLIENTE = 'CLIENTE',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);