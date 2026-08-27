import { Injectable } from '@nestjs/common';

export const UUID_GENERATOR = Symbol('USER_ID_GENERATOR');

export interface IdGenerator {
  generate(): string;
}

@Injectable()
export class UuidGenerator implements IdGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}
