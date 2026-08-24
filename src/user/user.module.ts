import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaUserRepository } from './prisma-user.repository';
import { UUID_GENERATOR, UuidGenerator } from 'src/common/id-generator';
import { USER_REPOSITORY } from './user.repository';
import { TokenModule } from '@token/token.module';
import { ProfileController } from './profile.controller';

@Module({
  controllers: [UserController, ProfileController],
  imports: [TokenModule],
  providers: [
    UserService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: UUID_GENERATOR, useClass: UuidGenerator },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
