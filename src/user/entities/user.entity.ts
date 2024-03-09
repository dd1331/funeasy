import * as bcrypt from 'bcrypt';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SALT_OR_ROUNDS } from '../constants';
import { CreateUserDto } from '../dto/create-user.dto';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  cash: number;

  async signup({ password, email }: CreateUserDto) {
    const hash = await bcrypt.hash(password, SALT_OR_ROUNDS);

    this.password = hash;
    this.email = email;
  }

  async login({ password }: { password: string }) {
    const isValid = await bcrypt.compare(password, this.password);

    if (!isValid) return null;
    return this;
  }
}
