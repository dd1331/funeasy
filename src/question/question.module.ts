import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QUESTION_REPOSITORY } from './constants';
import { Question } from './entities/question.entity';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { TypeQuestionRespository } from './repository/type-question.repository';

@Module({
  imports: [CacheModule.register(), TypeOrmModule.forFeature([Question])],
  controllers: [QuestionController],
  providers: [
    QuestionService,
    { provide: QUESTION_REPOSITORY, useClass: TypeQuestionRespository },
  ],
})
export class QuestionModule {}
