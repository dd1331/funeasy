import { fakerKO } from '@faker-js/faker';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from '../dto/create-user.dto';

describe('createUserDto', () => {
  it('성공', async () => {
    const plain: CreateUserDto = {
      password: fakerKO.string.alphanumeric(20),
      name: 'test',
      email: fakerKO.internet.email(),
    };

    const dto = plainToClass(CreateUserDto, plain);

    const res = await validate(dto);

    expect(res).toHaveLength(0);
  });

  it('길이 안맞음', async () => {
    const plain: CreateUserDto = {
      email: fakerKO.internet.email(),
      password: fakerKO.string.alphanumeric(21),
      name: 'test',
    };

    const dto = plainToClass(CreateUserDto, plain);

    const res = await validate(dto);

    expect(res).toHaveLength(1);
  });

  it('값이 없음', async () => {
    const plain: CreateUserDto = {
      email: undefined,
      password: undefined,
      name: 'test',
    };

    const dto = plainToClass(CreateUserDto, plain);

    const res = await validate(dto);

    expect(res).toHaveLength(2);
  });
});
