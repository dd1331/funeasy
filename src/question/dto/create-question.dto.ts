import { QuestionType } from '../entities/question.entity';

export class CreateQuestionDto {
  title: string;
  answer: string;
  mid: string;
  quantity: number;
  type: QuestionType;
}
