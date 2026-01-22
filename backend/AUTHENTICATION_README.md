# ByteChain Academy - Authentication System

A complete, production-ready authentication system built with NestJS, featuring user registration, secure login, password recovery, and JWT-based authentication.

## 🚀 Features

- **User Registration** with email validation and password hashing
- **Secure Login** with JWT token generation
- **Password Recovery** with time-limited reset tokens
- **JWT Authentication** with reusable guard system
- **Role-based Access Control** ready
- **SQLite Database** with TypeORM
- **Input Validation** with class-validator
- **Password Security** with bcrypt hashing

## 📋 API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "role": "user"
  },
  "token": "jwt-token-string"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "role": "user"
  },
  "token": "jwt-token-string"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset link sent to your email"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-string",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### Protected Endpoints

#### Get Profile (Example Protected Route)
```http
GET /profile
Authorization: Bearer jwt-token-string
```

**Response:**
```json
{
  "message": "Protected profile data",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "role": "user"
  }
}
```

## 🔐 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt (10 rounds)
- **JWT Tokens**: Secure JWT tokens with 24-hour expiration
- **Input Validation**: Comprehensive validation for all inputs
- **Reset Token Security**: Time-limited, hashed reset tokens
- **Role-based Access**: Built-in role system for future RBAC
- **SQL Injection Protection**: TypeORM provides parameterized queries

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
cd backend
npm install
```

### Environment Configuration
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_TYPE=sqlite
DB_DATABASE=database.sqlite
PORT=3000
```

### Running the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📁 Project Structure

```
src/
├── entities/
│   └── user.entity.ts          # User database entity
├── dto/
│   └── auth.dto.ts             # Data Transfer Objects
├── services/
│   ├── user.service.ts         # User business logic
│   └── auth.service.ts         # Authentication logic
├── controllers/
│   ├── auth.controller.ts      # Auth endpoints
│   └── profile.controller.ts   # Example protected endpoint
├── strategies/
│   └── jwt.strategy.ts         # JWT validation strategy
├── guards/
│   └── jwt-auth.guard.ts       # Reusable JWT guard
└── modules/
    └── auth.module.ts          # Auth module configuration
```

## 🔧 Using the JwtAuthGuard

The `JwtAuthGuard` is a reusable guard that protects routes requiring authentication:

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('protected')
export class ProtectedController {
  @Get()
  @UseGuards(JwtAuthGuard)
  getProtectedData(@Request() req) {
    // req.user contains authenticated user data
    return { user: req.user };
  }
}
```

## 🎯 Future Enhancements

- **Email Service Integration**: Connect to real email service for password reset
- **Role-based Guards**: Implement admin-only and role-specific guards
- **Rate Limiting**: Add rate limiting to prevent brute force attacks
- **Two-Factor Authentication**: Add 2FA support
- **Account Verification**: Email verification for new accounts
- **OAuth Integration**: Support for Google, GitHub, etc.

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:cov
```

## 📊 Database Schema

The `users` table contains:
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `role` (String, Default: 'user')
- `resetToken` (String, Nullable)
- `resetTokenExpires` (DateTime, Nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## 🔍 JWT Payload Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1642857600,
  "exp": 1642944000
}
```

## 🚨 Security Notes

1. **Change JWT Secret**: Always use a strong, unique JWT secret in production
2. **HTTPS**: Always use HTTPS in production to protect tokens
3. **Token Storage**: Store JWT tokens securely on the client side
4. **Password Requirements**: Consider implementing stronger password requirements
5. **Email Service**: Configure a real email service for password reset functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the UNLICENSED license.
