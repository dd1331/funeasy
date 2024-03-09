import { fakerKO } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { ormModuleOption } from '../common/orm-module-option';
import { CreateUserDto } from './dto/create-user.dto';
import { UserModule } from './user.module';
import { UserService } from './user.service';

describe('User e2e', () => {
  let app: INestApplication;
  let userService: UserService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(ormModuleOption), UserModule],
    }).compile();

    userService = module.get<UserService>(UserService);

    app = module.createNestApplication();
    await app.init();
  });
  afterEach(async () => await app.close());

  it('가입 성공', () => {
    const dto: CreateUserDto = {
      email: fakerKO.internet.email(),
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
      password: fakerKO.string.alphanumeric(10),
    };
    await userService.signup(dto);

    return request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(HttpStatus.CONFLICT);
  });
});
