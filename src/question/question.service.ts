import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { DataSource, In, MoreThan, Not, Repository } from 'typeorm';
import { UserCash } from '../user/entities/user-cash.entity';
import { User } from '../user/entities/user.entity';
import { QUESTION_TAKE } from './constants';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SolveQuestionDto } from './dto/solve-question.dto';
import { Question, QuestionType } from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
  ) {}
  create(createQuestionDto: CreateQuestionDto) {
    return 'This action adds a new question';
  }

  async findAll({
    take = QUESTION_TAKE,
    userId,
  }: {
    take?: number;
    userId: number;
  }) {
    const toExclude = await this.getQuestionMidsToExclude(userId);

    const data = await this.questionRepo.find({
      where: { mid: Not(In(toExclude)) },
      take,
    });

    return data;
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
    return this.dataSource.transaction(async (manager) => {
      const question = await manager
        .getRepository(Question)
        .findOneBy({ questionId: dto.questionId });

      question.solve(dto);
      // TODO: refactor
      const user = await this.dataSource.getRepository(User).findOne({
        where: { userId: dto.userId },
        relations: { cashLog: true },
      });

      user.getReward(question);
      await manager.save(question);
      await manager.save(user);

      return { ...question, ...user };
    });
  }

  update(id: number, updateQuestionDto: SolveQuestionDto) {
    return `This action updates a #${id} question`;
  }

  remove(id: number) {
    return `This action removes a #${id} question`;
  }
}
