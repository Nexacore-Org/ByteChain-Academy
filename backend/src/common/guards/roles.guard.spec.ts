import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

function createMockContext(
  user: any,
  handler = {},
  classRef = {},
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => classRef,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles metadata is set', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = createMockContext(null);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when roles metadata is an empty array', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const ctx = createMockContext(null);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when user role matches required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);
    const ctx = createMockContext({
      id: '1',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny access when user role does not match required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);
    const ctx = createMockContext({
      id: '2',
      email: 'user@test.com',
      role: UserRole.USER,
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should deny access when user is missing from request', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);
    const ctx = createMockContext(null);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should deny access when user has no role field', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);
    const ctx = createMockContext({ id: '3', email: 'user@test.com' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should use ROLES_KEY when reading metadata', () => {
    const spy = jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);
    const handler = {};
    const classRef = {};
    const ctx = createMockContext({ role: UserRole.ADMIN }, handler, classRef);
    guard.canActivate(ctx);
    expect(spy).toHaveBeenCalledWith(ROLES_KEY, [handler, classRef]);
  });
});
