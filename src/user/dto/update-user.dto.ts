import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

//TODO: validate
export class UpdateUserDto extends PartialType(CreateUserDto) {
  password?: string;
  name?: string;
}
