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
} from '@nestjs/common';
import { UserProfileResponseDto } from '../users/dto/user-profile-response.dto';
import { VerifyWalletDto } from '../users/dto/verify-wallet.dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserService } from './users.service';
import { WalletService } from './wallet.service';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
  ) {}

  @Get('me')
  async getMyProfile(@Request() req): Promise<UserProfileResponseDto> {
    const user = await this.userService.getMyProfile(req.user.id as string);
    return plainToInstance(UserProfileResponseDto, user);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)

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
}