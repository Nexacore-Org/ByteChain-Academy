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
  Post,
  UploadedFile,
  Param,
  ParseFilePipeBuilder,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { UserProfileResponseDto } from '../users/dto/user-profile-response.dto';

import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserService } from './users.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

type AvatarUploadFile = {
  size: number;
  mimetype: string;
  originalname: string;
  buffer: Buffer;
};

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMyProfile(@Request() req): Promise<UserProfileResponseDto> {
    const user = await this.userService.getMyProfile(req.user.id as string);
    return plainToInstance(UserProfileResponseDto, user);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminProfile() {
    return { message: 'Admin-only profile data' };
  }

  @Patch('me')
  async updateMyProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    await this.userService.updateProfile(req.user.id, updateProfileDto);
    const updatedUser = await this.userService.getMyProfile(
      req.user.id as string,
    );
    return plainToInstance(UserProfileResponseDto, updatedUser);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: Number(process.env.MAX_AVATAR_SIZE_MB || 2) * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadMyAvatar(
    @Request() req,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp|gif)$/ })
        .addMaxSizeValidator({
          maxSize: Number(process.env.MAX_AVATAR_SIZE_MB || 2) * 1024 * 1024,
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    file: AvatarUploadFile,
  ): Promise<{ avatarUrl: string }> {
    return this.userService.uploadAvatar(req.user.id as string, file);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Request() req): Promise<void> {
    await this.userService.deleteProfile(req.user.id);
  }

  @Get('me/stats')
  async getMyStats(@Request() req): Promise<{
    courseCount: number;
    completedCourseCount: number;
    certificateCount: number;
    xp: number;
    streak: number;
    badgesCount: number;
    rank: number;
  }> {
    return this.userService.getMyStats(req.user.id as string);
  }

  @Get(':id/public')
  async getPublicProfile(@Param('id') id: string): Promise<{
    id: string;
    username: string | null;
    xp: number;
    badgesCount: number;
    coursesCompleted: number;
    avatarUrl: string | null;
    bio: string | null;
  }> {
    return this.userService.getPublicProfile(id);
  }
}
