import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { FindOperator, MoreThan, Repository } from 'typeorm';
import { UserCash } from '../../user/entities/user-cash.entity';
import { Question, QuestionType } from '../entities/question.entity';
import { QuestionRepository } from './question.repository';

@Injectable()
export class TypeQuestionRespository
  extends Repository<Question>
  implements QuestionRepository
{
  constructor(
    @InjectRepository(Question)
    private readonly repository: Repository<Question>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getQuestionsToExcludeByType({
    userId,
    type,
  }: {
    userId: number;
    type: QuestionType;
  }) {
    const midnight = dayjs().startOf('D').toDate();
    const threeHoursAgo = dayjs().subtract(3, 'h').toDate();
    const aWeekAgo = dayjs().subtract(1, 'w').toDate();

    const where: {
      userId: number;
      question: { type: QuestionType };
      createdAt?: FindOperator<Date>;
    } = {
      userId,
      question: { type },
    };

    if (type === QuestionType.ONE) where.createdAt = MoreThan(midnight);
    if (type === QuestionType.TWO) where.createdAt = MoreThan(threeHoursAgo);
    if (type === QuestionType.FOUR) where.createdAt = MoreThan(aWeekAgo);

    return this.manager.getRepository(UserCash).find({
      where,
      relations: { question: true },
    });
  }
}
