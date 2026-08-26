import {
  Controller,
  Get,
  Delete,
  Req,
  UseGuards,
  HttpCode,
  Patch,
  Body,
} from '@nestjs/common';
import { SafeUser, UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UpdateUserDto, UpdateUserSchema } from './dto/update-user.dto';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    login: string;
  };
};

@Controller('profile')
export class ProfileController {
  constructor(private userService: UserService) {}
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getUsersProfile(@Req() request: AuthenticatedRequest) {
    const id = request.user.id;

    const user = await this.userService.findById(id);

    return user;
  }

  @Delete('my')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteMyProfile(@Req() request: AuthenticatedRequest): Promise<void> {
    await this.userService.softDelete(request.user.id);
  }

  @Patch('my')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Req() request: AuthenticatedRequest,
    @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
  ): Promise<SafeUser> {
    const user = await this.userService.updateUser({
      id: request.user.id,
      updateUserDto,
    });

    return user;
  }
}
