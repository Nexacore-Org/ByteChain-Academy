// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { JwtService } from '@nestjs/jwt';
// import { Request } from 'express';

// import { ROLES_KEY } from './roles.decorator';
// import { UserRole } from './roles.enum';

// // Define an interface for your JWT payload
// interface JwtPayload {
//   sub: string;
//   username: string;
//   roles: UserRole[];
//   [key: string]: any; // For any additional fields
// }

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     private jwtService: JwtService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     // Get the required roles from the route handler metadata
//     const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
//       ROLES_KEY,
//       [context.getHandler(), context.getClass()],
//     );

//     // If no roles are required, allow access
//     if (!requiredRoles || requiredRoles.length === 0) {
//       return true;
//     }

//     const request = context.switchToHttp().getRequest<Request>();
//     const token = this.extractTokenFromHeader(request);

//     if (!token) {
//       throw new UnauthorizedException('Access token is missing');
//     }

//     try {
//       // Verify and decode the JWT token with proper typing
//       const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
//         secret: process.env.JWT_SECRET, // Get this from your config
//       });

//       // Attach user to request for later use if needed
//       request['user'] = payload;

//       // Extract roles from the payload with safe checks
//       const userRoles: UserRole[] = Array.isArray(payload.roles)
//         ? payload.roles
//         : [];

//       // Check if the user has any of the required roles
//       const hasRequiredRole = requiredRoles.some((role) =>
//         userRoles.includes(role),
//       );

//       if (!hasRequiredRole) {
//         throw new ForbiddenException(
//           'Insufficient permissions to access this resource',
//         );
//       }

//       return true;
//     } catch (error) {
//       if (error instanceof ForbiddenException) {
//         throw error;
//       }
//       throw new UnauthorizedException('Invalid token or token expired');
//     }
//   }

//   private extractTokenFromHeader(request: Request): string | undefined {
//     const [type, token] = request.headers.authorization?.split(' ') ?? [];
//     return type === 'Bearer' ? token : undefined;
//   }
// }

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Ensure user exists and has a role
    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
