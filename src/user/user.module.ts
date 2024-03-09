import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TypeUserRespository } from './repository/type-user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, TypeUserRespository],
  exports: [TypeUserRespository, TypeOrmModule.forFeature([User])],
})
export class UserModule {}
