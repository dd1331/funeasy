import { Repository } from 'typeorm';
import { Question } from '../../question/entities/question.entity';

export interface QuestionRepository extends Repository<Question> {
  getQuestionsToExcludeByType;
}
