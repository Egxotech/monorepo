import { IsString, IsArray, IsOptional, MinLength, MaxLength, IsEnum } from 'class-validator';
import { PermissionCode } from '../../constants/permissions.constant';

export class CreateRoleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[]; // PermissionCode[]

  @IsOptional()
  order?: number; // Role hierarchy (higher = more powerful)
}