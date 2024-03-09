import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
