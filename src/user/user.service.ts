import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@generated/prisma/client';
// import { USER_ID_GENERATOR } from './user.tokens';

export type CreateUserResult =
  { ok: true; user: User } | { ok: false; error: 'Creation Error' };

@Injectable()
export class UserService {
  constructor(
    // TODO Add id generator to repo
    // @Inject(USER_ID_GENERATOR)
    // private readonly idGenerator: EventIdGenerator,
  ) {}
  createUser(createUserDto: CreateUserDto): CreateUserResult {
    // TODO
    // const id = this.idGenerator.generate();
    const id = 'id';

    return {
      ok: true,
      user: {
        ...createUserDto,
        id,
      },
    };
  }
}
