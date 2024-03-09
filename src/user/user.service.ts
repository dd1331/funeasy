import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from './constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}
  async signup(dto: CreateUserDto) {
    await this.checkEmailDuplication(dto.email);

    const user = this.userRepo.create();

    await user.signup(dto);

    await this.userRepo.save(user);

    return user;
  }

  private async checkEmailDuplication(email: string) {
    const exist = await this.userRepo.existsBy({ email });

    if (exist) throw new ConflictException('이미 존재하는 아이디입니다');
  }
}