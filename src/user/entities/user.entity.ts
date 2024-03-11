import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../../question/entities/question.entity';
import { SALT_OR_ROUNDS } from '../constants';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserCash } from './user-cash.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  cash: number;

  @OneToMany(() => UserCash, ({ user }) => user, { cascade: ['insert'] })
  cashLog: UserCash[];

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  getReward({ point, questionId }: Question) {
    if (!this.cashLog)
      throw new InternalServerErrorException('캐시로그 조회해야함');

    this.cash = this.cash + point;

    this.cashLog = [...this.cashLog, new UserCash({ cash: point, questionId })];
  }

  async signup({ password, ...rest }: CreateUserDto) {
    const hash = await bcrypt.hash(password, SALT_OR_ROUNDS);

    this.password = hash;
    Object.assign(this, rest);
  }

  async validatePassword({ password }: { password: string }) {
    const isValid = await bcrypt.compare(password, this.password);

    if (!isValid) return null;
    return this;
  }

  async update(dto: UpdateUserDto) {
    const { password, ...rest } = dto;

    if (password) this.password = await bcrypt.hash(password, SALT_OR_ROUNDS);

    Object.assign(this, rest);
  }
}
