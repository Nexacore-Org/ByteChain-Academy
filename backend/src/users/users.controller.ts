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
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { ProfileResponseDto } from '../users/dto/profile-response.dto';

import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserService } from './users.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { CertificateService } from '../certificates/certificates.service';
import { CoursesService } from '../courses/courses.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly certificateService: CertificateService,
    private readonly coursesService: CoursesService,
  ) {}

  @Get('profile')
  async getProfile(@Request() req): Promise<ProfileResponseDto> {
    const user = await this.userService.getProfile(req.user.id);
    return plainToInstance(ProfileResponseDto, user);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminProfile() {
    return { message: 'Admin-only profile data' };
  }

  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const user = await this.userService.updateProfile(
      req.user.id,
      updateProfileDto,
    );
    return plainToInstance(ProfileResponseDto, user);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Request() req): Promise<void> {
    await this.userService.deleteProfile(req.user.id);
  }

  @Get('me/stats')
  async getMeStats(@Request() req): Promise<{
    courseCount: number;
    certificateCount: number;
    xp: number;
  }> {
    const userId = req.user.id as string;
    const [userCourses, userCerts] = await Promise.all([
      this.coursesService.findUserCourses(userId),
      this.certificateService.getCertificatesByUser(userId),
    ]);
    const courseCount = userCourses.length;
    const certificateCount = userCerts.length;
    return this.userService.getStats(userId, courseCount, certificateCount);
  }
}
