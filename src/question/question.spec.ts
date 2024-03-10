import { SolveQuestionDto } from './dto/solve-question.dto';
import { Question, QuestionType } from './entities/question.entity';

describe('Question', () => {
  it('문제 타입1인 경우 정확하면 정답', () => {
    const OG_QUANTITY = 10;
    const question = new Question({
      answer: 'test',
      quantity: OG_QUANTITY,
      type: QuestionType.ONE,
    });

    const dto = new SolveQuestionDto({ answer: 'test' });
    const correct = question.solve(dto);

    expect(correct).toBe(true);
    expect(question.quantity).toBe(OG_QUANTITY - 1);
  });

  it('문제 타입2인 경우 정확하면 정답', () => {
    const OG_QUANTITY = 10;
    const question = new Question({
      answer: 'test',
      quantity: OG_QUANTITY,
      type: QuestionType.TWO,
    });

    const dto = new SolveQuestionDto({ answer: 'test' });
    const correct = question.solve(dto);

    expect(correct).toBe(true);
    expect(question.quantity).toBe(OG_QUANTITY - 1);
  });

  it('문제 타입3인 경우 title에 "a"를 더한 값과 같으면 정답', () => {
    const OG_QUANTITY = 10;
    const question = new Question({
      title: 'testTitle',
      answer: 'test',
      quantity: OG_QUANTITY,
      type: QuestionType.THREE,
    });

    const dto = new SolveQuestionDto({ answer: 'testTitlea' });
    const correct = question.solve(dto);

    expect(correct).toBe(true);
    expect(question.quantity).toBe(OG_QUANTITY - 1);
  });

  it('문제 타입4인 경우 title에 "b"를 더한 값과 같으면 정답', () => {
    const OG_QUANTITY = 10;
    const question = new Question({
      title: 'testTitle',
      answer: 'test',
      quantity: OG_QUANTITY,
      type: QuestionType.FOUR,
    });

    const dto = new SolveQuestionDto({ answer: 'testTitleb' });
    const correct = question.solve(dto);

    expect(correct).toBe(true);
    expect(question.quantity).toBe(OG_QUANTITY - 1);
  });

  it('남은 문제가 없으면 에러', () => {
    const question = new Question({
      title: 'testTitle',
      answer: 'test',
      quantity: 0,
      type: QuestionType.THREE,
    });

    const dto = new SolveQuestionDto({ answer: 'testTitlea' });

    expect(() => question.solve(dto)).toThrow();
  });
});
