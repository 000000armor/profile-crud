import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

type AuthenticatedRequest = Request & {
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
}
