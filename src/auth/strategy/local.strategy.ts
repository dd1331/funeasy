import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const dto = plainToClass(LoginDto, { email, password });

    const res = await validate(dto);

    if (res.length) throw new BadRequestException('입력한 정보를 확인해주세요');

    const user = await this.authService.validateUser(email, password);

    if (!user) throw new UnauthorizedException('로그인 실패');
    return user;
  }
}
