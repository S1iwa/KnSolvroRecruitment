import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { jest } from '@jest/globals';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn<() => Promise<any>>(),
      create: jest.fn<() => Promise<any>>(),
    },
  };

  const jwtServiceMock = {
    signAsync: jest.fn<() => Promise<string>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user and return access_token', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'secret123',
        name: 'Test',
      };
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        email: dto.email,
        name: dto.name,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hashed',
      });
      jwtServiceMock.signAsync.mockResolvedValue('token123');

      const result = await service.register(dto);
      expect(result).toHaveProperty('access_token', 'token123');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'existing@example.com',
      });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'pass',
          name: 'User',
        }),
      ).rejects.toThrow(ConflictException);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return access_token on valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        passwordHash: hash,
        role: 'USER',
      });
      jwtServiceMock.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        passwordHash: hash,
        role: 'USER',
      });

      await expect(
        service.login({
          email: 'user@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
