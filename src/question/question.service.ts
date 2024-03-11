import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { DataSource, In, MoreThan, Not } from 'typeorm';
import { NotEnoughQuantityException } from '../common/not-enough-quantity.exception';
import { User } from '../user/entities/user.entity';
import {
  QUESTION_REPOSITORY,
  QUESTION_TAKE,
  USER_QUESTION_CACHE_KEY,
} from './constants';
import { SolveQuestionDto } from './dto/solve-question.dto';
import { Question, QuestionType } from './entities/question.entity';
import { QuestionRepository } from './repository/question.repository';

@Injectable()
export class QuestionService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly dataSource: DataSource,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepo: QuestionRepository,
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
      order: { quantity: 'DESC' },
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
    const allQuestionsToExcludePromise = Object.values(QuestionType).map(
      (type: QuestionType) =>
        this.questionRepo.getQuestionsToExcludeByType({
          userId,
          type,
        }),
    );

    const allQuestionsToExclude = await Promise.all(
      allQuestionsToExcludePromise,
    );

    const toExclude = [
      ...new Set([
        ...allQuestionsToExclude
          .flatMap((question) => question)
          .map(({ question }) => question.mid),
      ]),
    ];

    return toExclude;
  }

  async solve(dto: SolveQuestionDto & { userId: number; questionId: number }) {
    return this.dataSource
      .transaction(async (manager) => {
        const question = await manager.getRepository(Question).findOne({
          lock: { mode: 'pessimistic_write' },
          where: { questionId: dto.questionId },
        });

        if (!question) throw new NotFoundException();

        question.solve(dto);

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
