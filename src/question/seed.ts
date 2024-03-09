import { fakerKO } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question, QuestionType } from './entities/question.entity';

export const seedQuestions = async (
  dataSource: DataSource,
  length: number = 5,
) => {
  const repo = dataSource.getRepository(Question);
  const mids = Array(length)
    .fill(null)
    .map((_, index) => index.toString());

  const promises = mids.map(async (mid) => {
    const dto: CreateQuestionDto = {
      title: fakerKO.lorem.sentences(2),
      answer: fakerKO.lorem.word(5),
      mid,
      quantity: fakerKO.number.int(10),
      type: QuestionType.ANY_TIME,
    };

    const dto2: CreateQuestionDto = {
      title: fakerKO.lorem.sentences(2),
      answer: fakerKO.lorem.word(5),
      mid,
      quantity: fakerKO.number.int(10),
      type: QuestionType.ANY_TIME,
    };
    await repo.save([dto, dto2]);
  });

  await Promise.all(promises);
};
