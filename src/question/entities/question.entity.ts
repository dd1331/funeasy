import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SolveQuestionDto } from '../dto/solve-question.dto';

export enum QuestionType {
  EVERY_THREE_HOURS = 'EVERY_THREE',
  ONCE_A_DAY = 'ONCE_DAY',
  ANY_TIME = 'ANY_TIME',
}

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  questionId: number;

  @Column()
  title: string;

  @Column()
  answer: string;

  @Column()
  mid: string;

  @Column()
  quantity: number;

  @Column()
  type: QuestionType;

  solve(dto: SolveQuestionDto) {
    // TODO: lock
    const correct = this.isCorrect(dto);
    if (correct) this.quantity = this.quantity - 1;

    return this.answer === dto.answer;
  }

  isCorrect(dto: SolveQuestionDto) {
    return this.answer === dto.answer;
  }
}
