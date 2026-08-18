import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { type CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  createUser(@Body() createUserDto: CreateUserDto) {
    const result = this.userService.createUser(createUserDto);

    if (result.ok) {
      return result.user;
    } else {
      throw new BadRequestException(result.error);
    }
  }
}
