import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PasswordHashingService } from './password.hashing.service';

@Injectable()
export class BcryptHashingService implements PasswordHashingService {
  /**
   * Hashes a password using bcryptjs
   * @param password Plain text password to hash
   * @returns Promise resolving to the hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  /**
   * Compares a plain text password against a hashed password
   * @param plainTextPassword Plain text password to check
   * @param hashedPassword Hashed password to compare against
   * @returns Promise resolving to boolean indicating if passwords match
   */
  async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
