import { fakerKO } from '@faker-js/faker';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UpdateUserDto', () => {
  it('성공', async () => {
    const plain: UpdateUserDto = {
      password: fakerKO.string.alphanumeric(20),
      name: 'test',
    };

    const dto = plainToClass(UpdateUserDto, plain);

    const res = await validate(dto);

    expect(res).toHaveLength(0);
  });

  it('길이 안맞음', async () => {
    const plain: UpdateUserDto = {
      password: fakerKO.string.alphanumeric(21),
      name: 'test',
    };

    const dto = plainToClass(UpdateUserDto, plain);

    const res = await validate(dto);

    expect(res).toHaveLength(1);
  });

  it('값이 없어도됨', async () => {
    const plain: UpdateUserDto = {
      password: undefined,
      name: undefined,
    };

    const dto = plainToClass(UpdateUserDto, plain);

    const res = await validate(dto);

    expect(res).toHaveLength(0);
  });
  it('이름 없어도됨', async () => {
    const plain: UpdateUserDto = {
      password: 'undefined',
      name: undefined,
    };

    const dto = plainToClass(UpdateUserDto, plain);

    const res = await validate(dto);

    expect(res).toHaveLength(0);
  });
  it('비밀번호 없어도됨', async () => {
    const plain: UpdateUserDto = {
      password: undefined,
      name: 'test',
    };

    const dto = plainToClass(UpdateUserDto, plain);

    const res = await validate(dto);

    expect(res).toHaveLength(0);
  });
});
