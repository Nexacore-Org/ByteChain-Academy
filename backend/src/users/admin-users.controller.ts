import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserService } from './users.service';
import { UserRole } from './entities/user.entity';
import { AdminUpdateRoleDto } from './dto/admin-update-role.dto';
import { AdminSuspendUserDto } from './dto/admin-suspend-user.dto';
import {
  AdminUserDetailDto,
  AdminUserListItemDto,
  AdminUsersListResponseDto,
} from './dto/admin-user-response.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth('access-token')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly userService: UserService) {}

  private getActorId(req: ExpressRequest & { user: { id: string } }): string {
    return req.user.id;
  }

  @Get()
  @ApiOperation({ summary: 'List users with pagination and optional search' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ type: AdminUsersListResponseDto })
  async listUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<AdminUsersListResponseDto> {
    const result = await this.userService.adminListUsers(
      Number(page),
      Number(limit),
      search,
    );

    return {
      ...result,
      data: result.data.map((user) => this.toListItemDto(user)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full user profile by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: AdminUserDetailDto })
  async getUser(@Param('id') id: string): Promise<AdminUserDetailDto> {
    const user = await this.userService.adminGetUser(id);
    return this.toDetailDto(user);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: AdminUpdateRoleDto })
  @ApiOkResponse({ type: AdminUserDetailDto })
  async updateRole(
    @Request() req: ExpressRequest & { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: AdminUpdateRoleDto,
  ): Promise<AdminUserDetailDto> {
    const user = await this.userService.adminUpdateRole(
      this.getActorId(req),
      id,
      dto.role,
    );
    return this.toDetailDto(user);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend or unsuspend a user account' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: AdminSuspendUserDto })
  @ApiOkResponse({ type: AdminUserDetailDto })
  async suspendUser(
    @Param('id') id: string,
    @Body() dto: AdminSuspendUserDto,
  ): Promise<AdminUserDetailDto> {
    const user = await this.userService.adminSuspendUser(id, dto.suspended);
    return this.toDetailDto(user);
  }

  private toListItemDto(user: {
    id: string;
    email: string;
    username: string | null;
    name: string | null;
    role: UserRole;
    suspended: boolean;
    createdAt: Date;
  }): AdminUserListItemDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username ?? user.name ?? null,
      role: user.role,
      suspended: user.suspended,
      createdAt: user.createdAt,
    };
  }

  private toDetailDto(user: {
    id: string;
    email: string;
    username: string | null;
    name: string | null;
    bio: string | null;
    walletAddress: string | null;
    avatarUrl: string | null;
    role: UserRole;
    suspended: boolean;
    points: number;
    xp: number;
    streak: number;
    longestStreak: number;
    lastActiveAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): AdminUserDetailDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username ?? user.name ?? null,
      name: user.name,
      bio: user.bio,
      walletAddress: user.walletAddress,
      avatarUrl: user.avatarUrl,
      role: user.role,
      suspended: user.suspended,
      points: user.points ?? 0,
      xp: user.xp ?? user.points ?? 0,
      streak: user.streak ?? 0,
      longestStreak: user.longestStreak ?? 0,
      lastActiveAt: user.lastActiveAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
