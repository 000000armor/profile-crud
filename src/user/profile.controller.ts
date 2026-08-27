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
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UpdateUserDto, UpdateUserSchema } from './dto/update-user.dto';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UpdateUserResponseDto } from './dto/update-response.dto';
import { UserResponseDto } from './dto/user-response.dto';

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    login: string;
  };
};

@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private userService: UserService) {}

  @Get('my')
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Current user profile',
  })
  @UseGuards(JwtAuthGuard)
  async getUsersProfile(@Req() request: AuthenticatedRequest) {
    const id = request.user.id;

    const user = await this.userService.findById(id);

    return user;
  }

  @Delete('my')
  @HttpCode(204)
  @ApiNoContentResponse({
    description: 'Profile soft-deleted',
  })
  @UseGuards(JwtAuthGuard)
  async deleteMyProfile(@Req() request: AuthenticatedRequest): Promise<void> {
    await this.userService.softDelete(request.user.id);
  }

  @Patch('my')
  @HttpCode(200)
  @ApiOkResponse({
    type: UpdateUserResponseDto,
    description: 'User data',
  })
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
