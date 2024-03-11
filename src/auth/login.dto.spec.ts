import { fakerKO } from '@faker-js/faker';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './dto/login.dto';

describe('LoginDto', () => {
  it('성공', async () => {
    const plain: LoginDto = {
      password: fakerKO.string.alphanumeric(20),

      email: fakerKO.internet.email(),
    };

    const dto = plainToClass(LoginDto, plain);

    const res = await validate(dto);

    expect(res).toHaveLength(0);
  });

  it('길이 안맞음', async () => {
    const plain: LoginDto = {
      email: fakerKO.internet.email(),
      password: fakerKO.string.alphanumeric(21),
    };

    const dto = plainToClass(LoginDto, plain);

    const res = await validate(dto);

    expect(res).toHaveLength(1);
  });

  it('값이 없음', async () => {
    const plain: LoginDto = {
      email: undefined,
      password: undefined,
    };

    const dto = plainToClass(LoginDto, plain);

    const res = await validate(dto);

    expect(res).toHaveLength(2);
  });
});
