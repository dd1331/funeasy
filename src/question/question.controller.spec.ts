import { fakerKO } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { WRONG_CODE } from '../common/constants';
import { HttpExceptionFilter } from '../common/http-exception.filter';
import { ormModuleOption } from '../common/orm-module-option';
import { ResponseInterceptor } from '../common/response.interceptor';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { DEFAULT_CASH, QUESTION_TAKE } from './constants';
import { SolveQuestionDto } from './dto/solve-question.dto';
import { Question, QuestionType } from './entities/question.entity';
import { QuestionModule } from './question.module';
import { QuestionService } from './question.service';
import { seedQuestions } from './seed';
describe('Question e2e', () => {
  let app: INestApplication;
  let userService: UserService;
  let authService: AuthService;
  let dataSource: DataSource;
  let module: TestingModule;
  beforeEach(async () => {
    module = await Test.createTestingModule({
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
    let user: User;
    beforeEach(async () => {
      const dto: CreateUserDto = {
        email: fakerKO.internet.email(),
        name: fakerKO.person.fullName(),
        password: '1234',
      };

      user = await userService.signup(dto);
      const { accessToken } = authService.login(user);
      token = accessToken;
    });

    afterEach(() => {
      // jest.clearAllTimers();
      jest.useRealTimers();
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

    it('유저는 동일한 mid를 가진 타입1 문제에 대해 하루에 한번만 참여가 가능하다 (자정을 기준으로 함)', async () => {
      const questionService = module.get<QuestionService>(QuestionService);
      await seedQuestions(dataSource, 5);
      const typeOne = await dataSource
        .getRepository(Question)
        .findOneBy({ type: QuestionType.ONE });

      const questions = await questionService.findAll({
        userId: user.userId,
        take: 100,
      });
      await questionService.solve({
        userId: user.userId,
        questionId: typeOne.questionId,
        answer: typeOne.answer,
      });

      const questionsExcludingTypeOne = await questionService.findAll({
        userId: user.userId,
        take: 100,
      });

      // TODO: refactor 3은 시드데이터 만들때 반복 한번에 몇개를 만드는지에 의존하고 있어 깨질우려
      expect(questionsExcludingTypeOne.length).toBe(questions.length - 3);
    });

    it('유저는 동일한 mid를 가진 타입1 문제에 대해 하루에 한번만 참여가 가능하다(자정기준 하루 지난경우)', async () => {
      const questionService = module.get<QuestionService>(QuestionService);
      await seedQuestions(dataSource, 5);
      const typeOne = await dataSource
        .getRepository(Question)
        .findOneBy({ type: QuestionType.ONE });

      const questions = await questionService.findAll({
        userId: user.userId,
        take: 100,
      });
      await questionService.solve({
        userId: user.userId,
        questionId: typeOne.questionId,
        answer: typeOne.answer,
      });
      jest
        .useFakeTimers({ advanceTimers: true })
        .setSystemTime(dayjs().endOf('d').add(1, 'm').toDate());

      const questionsExcludingTypeOne = await questionService.findAll({
        userId: user.userId,
        take: 100,
      });

      expect(questionsExcludingTypeOne.length).toBe(questions.length);
    });

    it('유저는 동일한 mid를 가진 타입2 문제에 대해 3시간에 한 번 참여가능하다', async () => {
      const questionService = module.get<QuestionService>(QuestionService);
      await seedQuestions(dataSource, 5);
      const typeTwo = await dataSource
        .getRepository(Question)
        .findOneBy({ type: QuestionType.TWO });

      const questions = await questionService.findAll({
        userId: user.userId,
        take: 100,
      });
      await questionService.solve({
        userId: user.userId,
        questionId: typeTwo.questionId,
        answer: typeTwo.answer,
      });
      jest
        .useFakeTimers({ advanceTimers: true })
        .setSystemTime(dayjs().add(2, 'h').add(59, 'm').toDate());

      const questionsExcludingTypeTwo = await questionService.findAll({
        userId: user.userId,
        take: 100,
      });

      // TODO: refactor 3은 시드데이터 만들때 반복 한번에 몇개를 만드는지에 의존하고 있어 깨질우려
      expect(questionsExcludingTypeTwo.length).toBe(questions.length - 3);
    });

    it('유저는 동일한 mid를 가진 타입2 문제에 대해 3시간에 한번만 참여가 가능하다(3시간 지난경우)', async () => {
      const questionService = module.get<QuestionService>(QuestionService);
      await seedQuestions(dataSource, 5);
      const typeTwo = await dataSource
        .getRepository(Question)
        .findOneBy({ type: QuestionType.TWO });

      const questions = await questionService.findAll({
        userId: user.userId,
        take: 100,
      });
      await questionService.solve({
        userId: user.userId,
        questionId: typeTwo.questionId,
        answer: typeTwo.answer,
      });

      jest
        .useFakeTimers({ advanceTimers: true })
        .setSystemTime(dayjs().add(3, 'h').toDate());

      const questionsExcludingTypeTwo = await questionService.findAll({
        userId: user.userId,
        take: 100,
      });

      expect(questionsExcludingTypeTwo.length).toBe(questions.length);
    });
    it('유저는 동일한 mid를 가진 타입3 문제에 대해 전체기간에 한 번 참여가능하다', async () => {
      const questionService = module.get<QuestionService>(QuestionService);
      await seedQuestions(dataSource, 5);
      const typeThree = await dataSource
        .getRepository(Question)
        .findOneBy({ type: QuestionType.THREE });

      const questions = await questionService.findAll({
        userId: user.userId,
        take: 100,
      });
      await questionService.solve({
        userId: user.userId,
        questionId: typeThree.questionId,
        answer: typeThree.title + 'a',
      });

      const questionsExcludingTypeThree = await questionService.findAll({
        userId: user.userId,
        take: 100,
      });

      // TODO: refactor 3은 시드데이터 만들때 반복 한번에 몇개를 만드는지에 의존하고 있어 깨질우려
      expect(questionsExcludingTypeThree.length).toBe(questions.length - 3);
    });
  });

  describe('문제 풀기', () => {
    let token;
    let user: User;
    beforeEach(async () => {
      const dto: CreateUserDto = {
        email: fakerKO.internet.email(),
        name: fakerKO.person.fullName(),
        password: '1234',
      };

      user = await userService.signup(dto);
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

    it('정답일경우 할당된 캐시를 유저에게 추가하고 캐시로그를 남김', async () => {
      const questionService = module.get<QuestionService>(QuestionService);
      const [question, question2] = await seedQuestions(dataSource);

      const dto: SolveQuestionDto = { answer: question.answer };

      const solved = await questionService.solve({
        userId: user.userId,
        questionId: question.questionId,
        ...dto,
      });
      expect(solved.cashLog.length).toBe(1);
      expect(solved.cash).toBe(DEFAULT_CASH);

      const dto2: SolveQuestionDto = { answer: question2.answer };
      const solved2 = await questionService.solve({
        userId: user.userId,
        questionId: question2.questionId,
        ...dto2,
      });

      expect(solved2.cashLog.length).toBe(2);
      expect(solved2.cash).toBe(DEFAULT_CASH * 2);
    });

    it('문제 타입관계없이 오답이면 코드 1', async () => {
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
