import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  readonly fullname: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email' })
  @MinLength(5)
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  readonly kode_unik: string;
}