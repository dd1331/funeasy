import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as dayjs from 'dayjs';
import { DataSource, In, MoreThan, Not, Repository } from 'typeorm';
import { UserCash } from '../user/entities/user-cash.entity';
import { User } from '../user/entities/user.entity';
import { QUESTION_TAKE, USER_QUESTION_CACHE_KEY } from './constants';
import { SolveQuestionDto } from './dto/solve-question.dto';
import { NotEnoughQuantityException } from './entities/not-enough-quantity.exception';
import { Question, QuestionType } from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly dataSource: DataSource,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
  ) {}

  private async getFilteredQuestions({
    take = QUESTION_TAKE,
    userId,
  }: {
    take?: number;
    userId: number;
  }) {
    const toExclude = await this.getQuestionMidsToExclude(userId);

    const questions = await this.questionRepo.find({
      where: { mid: Not(In(toExclude)), quantity: MoreThan(0) },
      take,
    });

    this.setCachedQuestionIds(userId, questions);

    return questions;
  }

  private async getCachedQuestionIds(userId: number) {
    return await this.cacheManager.get<number[]>(
      USER_QUESTION_CACHE_KEY + userId,
    );
  }

  private async setCachedQuestionIds(userId: number, questions: Question[]) {
    this.cacheManager.set(
      USER_QUESTION_CACHE_KEY + userId,
      questions.map(({ questionId }) => questionId),
    );
  }

  async getQuestions({
    take = QUESTION_TAKE,
    userId,
  }: {
    take?: number;
    userId: number;
  }) {
    const cachedQuestionIds = await this.getCachedQuestionIds(userId);

    const isCached = cachedQuestionIds?.length;

    if (!isCached) return this.getFilteredQuestions({ userId, take });

    return this.getQuestionsByCachedIds({
      questionIds: cachedQuestionIds,
      userId,
      take,
    });
  }

  private async getQuestionsByCachedIds({
    questionIds,
    userId,
    take,
  }: {
    questionIds: number[];
    take: number;
    userId: number;
  }) {
    const cachedQuestions = await this.questionRepo.find({
      where: { questionId: In(questionIds), quantity: MoreThan(0) },
      take,
    });

    if (!this.isCacheValid(cachedQuestions))
      return this.getFilteredQuestions({ take, userId });

    return cachedQuestions;
  }

  private isCacheValid(cachedQuestions: Question[]) {
    return (
      cachedQuestions.length < QUESTION_TAKE ||
      cachedQuestions.some(({ quantity }) => !quantity) // TODO:??
    );
  }

  private async getQuestionMidsToExclude(userId: number) {
    // TODO: refactor
    const typeOneToExclude = await this.dataSource
      .getRepository(UserCash)
      .find({
        where: {
          createdAt: MoreThan(dayjs().startOf('D').toDate()),
          userId,
          question: { type: QuestionType.ONE },
        },
        relations: { question: true },
      });

    const typeTwoToExclude = await this.dataSource
      .getRepository(UserCash)
      .find({
        where: {
          createdAt: MoreThan(dayjs().subtract(3, 'h').toDate()),
          userId,
          question: { type: QuestionType.TWO },
        },
        relations: { question: true },
      });
    const typeThreeToExclude = await this.dataSource
      .getRepository(UserCash)
      .find({
        where: {
          userId,
          question: { type: QuestionType.THREE },
        },
        relations: { question: true },
      });

    const toExclude = [
      ...new Set([
        ...typeOneToExclude.map(({ question }) => question.mid),
        ...typeTwoToExclude.map(({ question }) => question.mid),
        ...typeThreeToExclude.map(({ question }) => question.mid),
      ]),
    ];
    return toExclude;
  }

  async solve(dto: SolveQuestionDto & { userId: number; questionId: number }) {
    return this.dataSource
      .transaction(async (manager) => {
        const question = await manager
          .getRepository(Question)
          .findOneBy({ questionId: dto.questionId });
        // TODO:notfound
        question.solve(dto);
        // TODO: refactor
        const user = await this.dataSource.getRepository(User).findOne({
          where: { userId: dto.userId },
          relations: { cashLog: true },
        });

        user.getReward(question);
        await manager.save(question);
        await manager.save(user);

        this.cacheManager.reset();
        return { ...question, ...user };
      })
      .catch((err) => {
        if (err instanceof NotEnoughQuantityException)
          this.cacheManager.reset();
        throw err;
      });
  }
}
