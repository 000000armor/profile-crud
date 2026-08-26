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
import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  FindUserQueryDto,
  FindUserQuerySchema,
} from './dto/find-users-query.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { FindUserResponseDto } from './dto/find-user-response.dto';
import { CreateUserResponseDto } from './dto/create-user-response.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @HttpCode(201)
  @ApiCreatedResponse({
    type: CreateUserResponseDto,
    description: 'Created user and tokens issued',
  })
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.createUser(createUserDto);

    return {
      user: result.user,
      ...result.tokens,
    };
  }

  @ApiBearerAuth()
  @Get()
  @HttpCode(200)
  @ApiOkResponse({
    type: FindUserResponseDto,
    description: 'Multiple users and pagination data',
  })
  @UseGuards(JwtAuthGuard)
  async findUsers(
    @Query(new ZodValidationPipe(FindUserQuerySchema)) query: FindUserQueryDto,
  ) {
    return this.userService.findUsers(query);
  }
}
