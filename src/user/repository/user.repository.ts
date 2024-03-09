import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface UserRepository extends Repository<User> {}
