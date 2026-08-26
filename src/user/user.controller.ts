import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { type CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  FindUserQueryDto,
  FindUserQuerySchema,
} from './dto/find-users-query.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.createUser(createUserDto);

    return {
      user: result.user,
      ...result.tokens,
    };
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async findUsers(
    @Query(new ZodValidationPipe(FindUserQuerySchema)) query: FindUserQueryDto,
  ) {
    return this.userService.findUsers(query);
  }
}
