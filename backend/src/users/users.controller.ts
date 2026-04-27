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
} from '@nestjs/common';
import { UserProfileResponseDto } from '../users/dto/user-profile-response.dto';
import { VerifyWalletDto } from '../users/dto/verify-wallet.dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserService } from './users.service';
import { WalletService } from './wallet.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
  ) { }

  @Get('me')
  async getMyProfile(@Request() req): Promise<UserProfileResponseDto> {
    const user = await this.userService.getMyProfile(req.user.id as string);
    return plainToInstance(UserProfileResponseDto, user);
  }

  @Post('me/wallet/challenge')
  @HttpCode(HttpStatus.OK)
  async generateWalletChallenge(
    @Request() req,
  ): Promise<{ challenge: string }> {
    return this.walletService.generateChallenge(req.user.id as string);
  }

  @Post('me/wallet/verify')
  @HttpCode(HttpStatus.OK)
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
  async getWalletStatus(
    @Request() req,
  ): Promise<{ linked: boolean; walletAddress?: string }> {
    return this.walletService.getStatus(req.user.id as string);
  }

  @Delete('me/wallet')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkWallet(@Request() req): Promise<void> {
    return this.walletService.unlink(req.user.id as string);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(
    @Request() req,
    @Body() dto: DeleteAccountDto,
  ): Promise<void> {
    await this.userService.deleteProfile(req.user.id, dto.password);
  }

  @Get('me/stats')
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