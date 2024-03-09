import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QUESTION_TAKE } from './constants';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SolveQuestionDto } from './dto/solve-question.dto';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
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

  async solve(questionId: number, dto: SolveQuestionDto) {
    const question = await this.questionRepo.findOneBy({ questionId });

    question.solve(dto);

    await this.questionRepo.save(question);

    return question;
  }

  update(id: number, updateQuestionDto: SolveQuestionDto) {
    return `This action updates a #${id} question`;
  }

  remove(id: number) {
    return `This action removes a #${id} question`;
  }
}
