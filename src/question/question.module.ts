import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [CacheModule.register(), TypeOrmModule.forFeature([Question])],
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
