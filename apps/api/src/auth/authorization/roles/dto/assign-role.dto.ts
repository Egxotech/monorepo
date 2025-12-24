import { IsInt, IsPositive } from 'class-validator';

export class AssignRoleDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  roleId: number;
}