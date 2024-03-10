import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { QUESTION_TAKE } from './constants';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SolveQuestionDto } from './dto/solve-question.dto';
import { Question } from './entities/question.entity';

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

  async findAll() {
    const data = await this.questionRepo.find({ take: QUESTION_TAKE });

    return data;
  }

  async solve(dto: SolveQuestionDto & { userId: number; questionId: number }) {
    return this.dataSource.transaction(async (manager) => {
      const question = await manager
        .getRepository(Question)
        .findOneBy({ questionId: dto.questionId });

      question.solve(dto);
      const user = await this.dataSource.getRepository(User).findOne({
        where: { userId: dto.userId },
        relations: { cashLog: true },
      });

      user.getReward(question.point);
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
