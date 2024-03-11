import { fakerKO } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { ormModuleOption } from '../common/orm-module-option';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';

describe('Auth e2e', () => {
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

  it('인가 실패', () => {
    return request(app.getHttpServer())
      .get('/auth/guarded')
      .expect(HttpStatus.UNAUTHORIZED);
  });
  it('인가 성공', async () => {
    const dto: CreateUserDto = {
      name: fakerKO.person.fullName(),
      email: fakerKO.internet.email(),
      password: '1234',
    };

    const user = await userService.signup(dto);

    const { accessToken } = await authService.login(user);

    return request(app.getHttpServer())
      .get('/auth/guarded')
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(HttpStatus.OK);
  });
  it('로그인 성공', async () => {
    const email = fakerKO.internet.email();
    const dto: CreateUserDto = {
      email: email,
      name: fakerKO.person.fullName(),
      password: '123456',
    };

    await userService.signup(dto);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: '123456' })
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.accessToken).toEqual(expect.any(String));
      });
  });
  it('로그인 실패', async () => {
    const dto: CreateUserDto = {
      email: fakerKO.internet.email(),
      name: fakerKO.person.fullName(),
      password: '1234',
    };

    await userService.signup(dto);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: fakerKO.internet.email(), password: 'wrongs' })
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
