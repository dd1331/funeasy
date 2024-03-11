import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 15)
  name: string;

  @IsNotEmpty()
  @Length(6, 20)
  @IsString()
  password: string;
}
