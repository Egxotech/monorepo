import { IsEmail, IsString, MinLength, MaxLength, IsArray, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[]; // Rol isimleri: ["Basic User", "Administrator"]
}