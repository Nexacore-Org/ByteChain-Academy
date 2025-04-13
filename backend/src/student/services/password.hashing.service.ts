import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class PasswordHashingService {
  abstract hashPassword(password: string): Promise<string>;
  abstract comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
