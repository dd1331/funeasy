import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ReqUser } from './user.decorator';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  signup(@Body() dto: CreateUserDto) {
    return this.userService.signup(dto);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  update(@ReqUser() { userId }, @Body() dto: UpdateUserDto) {
    return this.userService.update(userId, dto);
  }
}
