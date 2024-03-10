import { fakerKO } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { WRONG_CODE } from '../common/constants';
import { HttpExceptionFilter } from '../common/http-exception.filter';
import { ormModuleOption } from '../common/orm-module-option';
import { ResponseInterceptor } from '../common/response.interceptor';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { QUESTION_TAKE } from './constants';
import { SolveQuestionDto } from './dto/solve-question.dto';
import { Question } from './entities/question.entity';
import { QuestionModule } from './question.module';
import { seedQuestions } from './seed';

describe('Question e2e', () => {
  let app: INestApplication;
  let userService: UserService;
  let authService: AuthService;
  let dataSource: DataSource;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormModuleOption),
        AuthModule,
        QuestionModule,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);

    authService = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);

    app = module.createNestApplication();
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });
  afterEach(async () => await app.close());

  describe('문제조회', () => {
    let token;
    beforeEach(async () => {
      const dto: CreateUserDto = {
        email: fakerKO.internet.email(),
        name: fakerKO.person.fullName(),
        password: '1234',
      };

      const user = await userService.signup(dto);
      const { accessToken } = authService.login(user);
      token = accessToken;
    });

    it('문제 목록 5개 이상일시 3개 리턴', async () => {
      await seedQuestions(dataSource, 5);
      return request(app.getHttpServer())
        .get('/questions')
        .set({ Authorization: `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.data.length).toBe(QUESTION_TAKE);
        });
    });

    it('문제 목록 0개일시 code1', async () => {
      return request(app.getHttpServer())
        .get('/questions')
        .set({ Authorization: `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.data.code).toBe(1);
        });
    });

    it('문제 목록 5개 이상일시 3개 리턴', async () => {
      await seedQuestions(dataSource, 5);
      return request(app.getHttpServer())
        .get('/questions')
        .set({ Authorization: `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.data.length).toBe(QUESTION_TAKE);
        });
    });
    it('문제는 동일안 mid를 가질 수 있따', async () => {
      await seedQuestions(dataSource, 5);

      const { count } = await dataSource
        .getRepository(Question)
        .createQueryBuilder('question')
        .select('COUNT(question.questionId) count')
        .groupBy('question.mid')
        .getRawOne();

      expect(parseInt(count)).toBeGreaterThanOrEqual(2);
    });

    it('유저는 동일한 mid를 가진 문제에 대해 하루에 한번만 참여가 가능하다', async () => {
      await seedQuestions(dataSource, 5);

      const [first, ...rest] = await dataSource.getRepository(Question).find();

      expect(rest.some((question) => question.mid === first.mid)).toBe(true);
    });
  });

  describe('문제 풀기', () => {
    let token;
    beforeEach(async () => {
      const dto: CreateUserDto = {
        email: fakerKO.internet.email(),
        name: fakerKO.person.fullName(),
        password: '1234',
      };

      const user = await userService.signup(dto);
      const { accessToken } = authService.login(user);
      token = accessToken;
    });

    it('정답일경우 문제 총량 차감', async () => {
      const [question] = await seedQuestions(dataSource);

      const dto: SolveQuestionDto = { answer: question.answer };

      return request(app.getHttpServer())
        .post('/questions/' + question.questionId)
        .send(dto)
        .set({ Authorization: `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.data.quantity).toBe(question.quantity - 1);
        });
    });

    it('문제 타입관계없이 오답이면', async () => {
      const dto = new SolveQuestionDto({ answer: 'wrong' });

      const [questionType1, questionType2, questionType3] =
        await seedQuestions(dataSource);

      await request(app.getHttpServer())
        .post('/questions/' + questionType1.questionId)
        .send(dto)
        .set({ Authorization: `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.code).toBe(WRONG_CODE);
        });
      await request(app.getHttpServer())
        .post('/questions/' + questionType2.questionId)
        .send(dto)
        .set({ Authorization: `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(({ body }) => expect(body.code).toBe(WRONG_CODE));
      await request(app.getHttpServer())
        .post('/questions/' + questionType3.questionId)
        .send(dto)
        .set({ Authorization: `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(({ body }) => expect(body.code).toBe(WRONG_CODE));
    });
  });
});
