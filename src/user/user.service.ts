import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { USER_REPOSITORY } from './constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

  async update(userId: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOneBy({ userId });

    if (!user) throw new NotFoundException('존재하지 않는 유저입니다');

    await user.update(dto);

    const updated = await this.userRepo.save(user);

    return updated;
  }

  async closeAccount(userId: number) {
    const user = await this.userRepo.findOneBy({ userId });

    // TODO: 캐시로그삭제등 처리??

    if (!user) throw new NotFoundException('존재하지 않는 유저입니다');

    return await this.userRepo.softDelete({ userId });
  }
}
