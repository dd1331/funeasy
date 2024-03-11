import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @Length(2, 15)
  name: string;

  @IsNotEmpty()
  @IsOptional()
  @Length(6, 20)
  @IsString()
  password: string;
}
