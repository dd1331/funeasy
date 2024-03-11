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
    const dto: CreateQuestionDto = repo.create({
      title: fakerKO.lorem.sentences(2),
      answer: fakerKO.lorem.word(5),
      mid,
      quantity: fakerKO.number.int({ min: 3, max: 10 }),
      type: QuestionType.ONE,
    });

    const dto2: CreateQuestionDto = repo.create({
      title: fakerKO.lorem.sentences(2),
      answer: fakerKO.lorem.word(5),
      mid,
      quantity: fakerKO.number.int({ min: 3, max: 10 }),
      type: QuestionType.TWO,
    });
    const dto3: CreateQuestionDto = repo.create({
      title: fakerKO.lorem.sentences(2),
      answer: fakerKO.lorem.word(5),
      mid,
      quantity: fakerKO.number.int({ min: 3, max: 10 }),
      type: QuestionType.THREE,
    });
    const dto4: CreateQuestionDto = repo.create({
      title: fakerKO.lorem.sentences(2),
      answer: fakerKO.lorem.word(5),
      mid,
      quantity: fakerKO.number.int({ min: 3, max: 10 }),
      type: QuestionType.FOUR,
    });
    return repo.save([dto, dto2, dto3, dto4]);
  });

  const res = await Promise.all(promises);
  return res.flat();
};
