import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';

import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly userService: UserService) {} // Fixed here

  @Get('profile')
  async getProfile(@Request() req): Promise<ProfileResponseDto> {
    const user = await this.userService.getProfile(req.user.id); 
    return plainToInstance(ProfileResponseDto, user);
  }

  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const user = await this.userService.updateProfile(req.user.id, updateProfileDto);
    return plainToInstance(ProfileResponseDto, user);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Request() req): Promise<void> {
    await this.userService.deleteProfile(req.user.id); 
  }
}