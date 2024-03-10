export class GoodBaseDto<T> {
  constructor(dto?: Partial<T>) {
    Object.assign(this, dto);
  }
}
