import * as bcrypt from 'bcrypt';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SALT_OR_ROUNDS } from '../constants';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

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
