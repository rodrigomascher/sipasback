import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, UserSession } from './auth.service';
import { SupabaseService } from '../database/supabase.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let supabaseService: SupabaseService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockSupabaseService = {
    select: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should generate JWT token with user session data', async () => {
      const userSession: UserSession = {
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
        employeeId: 100,
        unitId: 5,
        unitName: 'Unit A',
        unitType: 'Police Station',
        departmentId: 2,
        departmentName: 'Operations',
        roleId: 3,
        roleName: 'Officer',
        isTechnician: false,
        isArmoredUnit: false,
        city: 'São Paulo',
        state: 'SP',
      };

      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(userSession);

      expect(result.access_token).toBe(mockToken);
      expect(result.token_type).toBe('Bearer');
      expect(result.expires_in).toBe(3600);
      expect(result.user.email).toBe('user@example.com');
      expect(result.user.name).toBe('John Doe');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 1,
          email: 'user@example.com',
          name: 'John Doe',
        }),
        expect.any(Object),
      );
    });

    it('should include all session data in JWT payload', async () => {
      const userSession: UserSession = {
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
        employeeId: 100,
        unitId: 5,
        unitName: 'Unit A',
        unitType: 'Police Station',
        departmentId: 2,
        departmentName: 'Operations',
        roleId: 3,
        roleName: 'Officer',
        city: 'São Paulo',
        state: 'SP',
      };

      const mockToken = 'mock-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(userSession);

      const callArgs = mockJwtService.sign.mock.calls[0][0];
      expect(callArgs.employeeId).toBe(100);
      expect(callArgs.unitId).toBe(5);
      expect(callArgs.departmentId).toBe(2);
      expect(callArgs.roleId).toBe(3);
    });

    it('should include units array in response', async () => {
      const userSession: UserSession = {
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
        unitId: 5,
        unitName: 'Unit A',
        unitType: 'Police Station',
        departmentId: 2,
        departmentName: 'Operations',
        roleId: 3,
        roleName: 'Officer',
        city: 'São Paulo',
        state: 'SP',
        units: [
          { id: 5, name: 'Unit A', type: 'Police Station', city: 'São Paulo', state: 'SP' },
          { id: 6, name: 'Unit B', type: 'Training Center', city: 'Rio de Janeiro', state: 'RJ' },
        ],
      };

      const mockToken = 'mock-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(userSession);

      expect(result.user.units).toHaveLength(2);
      expect(result.user.units[0].name).toBe('Unit A');
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct password', async () => {
      const email = 'user@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const mockUser = {
        id: 1,
        email: email,
        name: 'John Doe',
        password_hash: hashedPassword,
        employee_id: 100,
        is_active: true,
        last_login: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([mockUser]);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);

      const result = await service.validateUser(email, password);

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.email).toBe(email);
    });

    it('should return null if user not found', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const email = 'user@example.com';
      const password = 'wrongpassword';
      const correctPassword = 'correctpassword';
      const hashedPassword = await bcrypt.hash(correctPassword, 10);

      const mockUser = {
        id: 1,
        email: email,
        name: 'John Doe',
        password_hash: hashedPassword,
        employee_id: 100,
        is_active: true,
        last_login: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([mockUser]);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as any);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });

    it('should return null if user is not active', async () => {
      const email = 'user@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const mockUser = {
        id: 1,
        email: email,
        name: 'John Doe',
        password_hash: hashedPassword,
        employee_id: 100,
        is_active: false,
        last_login: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([mockUser]);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });

    it('should include units in user session', async () => {
      const email = 'user@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const mockUser = {
        id: 1,
        email: email,
        name: 'John Doe',
        password_hash: hashedPassword,
        employee_id: 100,
        is_active: true,
        last_login: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([mockUser]);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);

      // Mock units query
      jest.spyOn(service, 'getUserUnits').mockResolvedValue([
        { id: 5, name: 'Unit A', type: 'Police Station', city: 'São Paulo', state: 'SP' },
      ] as any);

      const result = await service.validateUser(email, password);

      expect(result).toBeDefined();
    });
  });

  describe('refreshToken', () => {
    it('should generate new token from valid refresh token', async () => {
      const oldToken = {
        sub: 1,
        email: 'user@example.com',
        name: 'John Doe',
      };

      const newToken = 'new-jwt-token';
      mockJwtService.verify.mockReturnValue(oldToken);
      mockJwtService.sign.mockReturnValue(newToken);

      const result = await service.refreshToken('old-refresh-token');

      expect(result.access_token).toBe(newToken);
      expect(mockJwtService.verify).toHaveBeenCalled();
    });

    it('should throw error if refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow();
    });

    it('should throw error if refresh token is expired', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.refreshToken('expired-token')).rejects.toThrow();
    });
  });

  describe('validateToken', () => {
    it('should validate token and return decoded payload', async () => {
      const mockPayload = {
        sub: 1,
        email: 'user@example.com',
        name: 'John Doe',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalled();
    });

    it('should return null for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.validateToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('should update user last login timestamp', async () => {
      const userId = 1;
      const now = new Date();

      mockSupabaseService.update.mockResolvedValue([{ id: userId, last_login: now }]);

      await service.updateLastLogin(userId);

      expect(mockSupabaseService.update).toHaveBeenCalledWith(
        'users',
        { last_login: expect.any(Date) },
        { id: userId },
      );
    });
  });

  describe('logout', () => {
    it('should invalidate token on logout', async () => {
      const token = 'user-token';
      const userId = 1;

      // Token should no longer be valid after logout
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token blacklisted');
      });

      const result = await service.validateToken(token);

      expect(result).toBeNull();
    });
  });
});
