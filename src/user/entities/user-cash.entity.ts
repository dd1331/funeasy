import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GoodBaseEntity } from '../../common/good-base.entity';
import { Question } from '../../question/entities/question.entity';
import { User } from './user.entity';

@Entity()
export class UserCash extends GoodBaseEntity<UserCash> {
  @PrimaryGeneratedColumn({ name: 'user_cash_id' })
  userCashId: number;

  @Column()
  cash: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'question_id' })
  questionId: number;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
