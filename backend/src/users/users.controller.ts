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
  Param,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserProfileResponseDto } from '../users/dto/user-profile-response.dto';
import { VerifyWalletDto } from '../users/dto/verify-wallet.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserService } from './users.service';
import { WalletService } from './wallet.service';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { RolesGuard } from '../common/guards/roles.guard';

type UploadedAvatarFile = {
  size: number;
  mimetype: string;
  originalname: string;
  buffer: Buffer;
};

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyProfile(@Request() req): Promise<UserProfileResponseDto> {
    const user = await this.userService.getMyProfile(req.user.id as string);
    return plainToInstance(UserProfileResponseDto, user);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get admin user data (admin only)' })
  @ApiResponse({ status: 200, description: 'Admin data retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  async getAdminData(@Request() req) {
    return { message: 'Admin data access' };
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  async uploadMyAvatar(
    @Request() req,
    @UploadedFile() file: UploadedAvatarFile,
  ) {
    return this.userService.uploadAvatar(req.user.id as string, file);
  }

  @Post('me/wallet/challenge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate wallet verification challenge' })
  @ApiResponse({ status: 200, description: 'Challenge generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateWalletChallenge(
    @Request() req,
  ): Promise<{ challenge: string }> {
    return this.walletService.generateChallenge(req.user.id as string);
  }

  @Post('me/wallet/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify and link wallet to user account' })
  @ApiResponse({ status: 200, description: 'Wallet linked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid signature' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyAndLinkWallet(
    @Request() req,
    @Body() dto: VerifyWalletDto,
  ): Promise<{ walletAddress: string }> {
    return this.walletService.verifyAndLink(
      req.user.id as string,
      dto.walletAddress,
      dto.signature,
    );
  }

  @Get('me/wallet')
  @ApiOperation({ summary: 'Get wallet connection status' })
  @ApiResponse({ status: 200, description: 'Wallet status retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWalletStatus(
    @Request() req,
  ): Promise<{ linked: boolean; walletAddress?: string }> {
    return this.walletService.getStatus(req.user.id as string);
  }

  @Delete('me/wallet')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlink wallet from user account' })
  @ApiResponse({ status: 204, description: 'Wallet unlinked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unlinkWallet(@Request() req): Promise<void> {
    return this.walletService.unlink(req.user.id as string);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: any,
  ): Promise<void> {
    await this.userService.updateProfile(req.user.id, updateProfileDto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteProfile(
    @Request() req,
    @Body() dto: DeleteAccountDto,
  ): Promise<void> {
    await this.userService.deleteProfile(req.user.id, dto.password);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get user statistics and achievements' })
  @ApiResponse({
    status: 200,
    description: 'User stats retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyStats(@Request() req): Promise<{
    courseCount: number;
    completedCourseCount: number;
    certificateCount: number;
    xp: number;
    streak: number;
    longestStreak: number;
    lastActiveAt: Date | null;
    badgesCount: number;
    rank: number;
  }> {
    return this.userService.getMyStats(req.user.id as string);
  }

  @Get(':id/public')
  @ApiOperation({ summary: 'Get public user profile by ID' })
  @ApiResponse({
    status: 200,
    description: 'Public profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
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
