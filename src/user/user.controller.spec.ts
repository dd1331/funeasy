import { fakerKO } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { ormModuleOption } from '../common/orm-module-option';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

describe('User e2e', () => {
  let app: INestApplication;
  let userService: UserService;
  let authService: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(ormModuleOption), AuthModule],
    }).compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);

    app = module.createNestApplication();
    await app.init();
  });
  afterEach(async () => await app.close());

  it('가입 성공', () => {
    const dto: CreateUserDto = {
      email: fakerKO.internet.email(),
      name: fakerKO.person.fullName(),
      password: fakerKO.string.alphanumeric(10),
    };
    return request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(HttpStatus.CREATED)
      .expect((res) => expect(res.body.userId).toEqual(expect.any(Number)));
  });

  it('이미 존재하는 아이디', async () => {
    const dto: CreateUserDto = {
      email: fakerKO.internet.email(),
      name: fakerKO.person.fullName(),
      password: fakerKO.string.alphanumeric(10),
    };
    await userService.signup(dto);

    return request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(HttpStatus.CONFLICT);
  });

  it('회원정보 수정', async () => {
    const dto: CreateUserDto = {
      email: fakerKO.internet.email(),
      name: fakerKO.person.fullName(),
      password: fakerKO.string.alphanumeric(10),
    };
    const updateDto: UpdateUserDto = {
      password: 'fakerKO.string.alphanumeric(10)',
      name: fakerKO.person.fullName(),
    };
    const user = await userService.signup(dto);
    const { accessToken } = authService.login(user);
    return request(app.getHttpServer())
      .put('/users')
      .send(updateDto)
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(HttpStatus.OK)
      .expect(async (res) => {
        expect(updateDto.password === res.body.password).toBe(false);
        expect(updateDto.name === res.body.name).toBe(true);
        expect(dto.name === res.body.name).toBe(false);
        expect(
          await bcrypt.compare(updateDto.password, res.body.password),
        ).toBe(true);
      });
  });

  it('회원탈퇴', async () => {
    const dto: CreateUserDto = {
      email: fakerKO.internet.email(),
      name: fakerKO.person.fullName(),
      password: fakerKO.string.alphanumeric(10),
    };
    const user = await userService.signup(dto);
    const { accessToken } = authService.login(user);
    return request(app.getHttpServer())
      .delete('/users')
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(HttpStatus.OK)
      .expect(async ({ body }) => expect(body.affected).toBe(1));
  });
});
