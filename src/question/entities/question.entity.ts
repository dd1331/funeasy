import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  type: string;
}
