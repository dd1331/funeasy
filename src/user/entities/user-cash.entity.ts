import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GoodBaseEntity } from '../../common/good-base.entity';
import { User } from './user.entity';

@Entity()
export class UserCash extends GoodBaseEntity<UserCash> {
  @PrimaryGeneratedColumn({ name: 'user_cash_id' })
  userCashId: number;

  @Column()
  cash: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
