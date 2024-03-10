import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GoodBaseEntity } from '../../common/good-base.entity';
import { DEFAULT_CASH } from '../constants';
import { SolveQuestionDto } from '../dto/solve-question.dto';
import { WrongAnsewrException } from './wrong-answer.exception';

export enum QuestionType {
  ONE = 'EVERY_THREE',
  TWO = 'ONCE_DAY',
  THREE = 'ANY_TIME',
}

@Entity()
export class Question extends GoodBaseEntity<Question> {
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

  @Column({ default: DEFAULT_CASH })
  point: number;

  @Column()
  type: QuestionType;

  solve(dto: SolveQuestionDto) {
    // TODO: lock
    const correct = this.isCorrect(dto);

    if (!correct) throw new WrongAnsewrException();

    this.deductQuantity();

    return correct;
  }

  private deductQuantity() {
    this.quantity = this.quantity - 1;
  }

  private isCorrect(dto: SolveQuestionDto) {
    if (this.type === QuestionType.ONE || this.type === QuestionType.TWO)
      return this.answer === dto.answer;
    if (this.type === QuestionType.THREE)
      return this.title + 'a' === dto.answer;
    return false;
  }
}
