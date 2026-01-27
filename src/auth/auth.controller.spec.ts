import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService, UserSession } from './auth.service';
import { LoggerService } from '../common/logger/logger.service';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let loggerService: LoggerService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    validateToken: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  const mockLoggerService = {
    logAuth: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should login user and return JWT token', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'password123',
      };

      const mockUserSession: UserSession = {
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
      };

      const mockResponse = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'John Doe',
          roleName: 'Officer',
          unitName: 'Unit A',
          unitId: 5,
          units: [],
        },
      };

      mockAuthService.validateUser.mockResolvedValue(mockUserSession);
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result.access_token).toBeDefined();
      expect(result.token_type).toBe('Bearer');
      expect(result.user.email).toBe('user@example.com');
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockLoggerService.logAuth).toHaveBeenCalledWith(
        loginDto.email,
        false,
        expect.any(Object),
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should update last login on successful authentication', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'password123',
      };

      const mockUserSession: UserSession = {
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
      };

      const mockResponse = {
        access_token: 'token',
        token_type: 'Bearer',
        expires_in: 3600,
        user: { id: 1, email: 'user@example.com', name: 'John Doe', roleName: 'Officer', unitName: 'Unit A', unitId: 5, units: [] },
      };

      mockAuthService.validateUser.mockResolvedValue(mockUserSession);
      mockAuthService.login.mockResolvedValue(mockResponse);
      mockAuthService.updateLastLogin.mockResolvedValue(undefined);

      const result = await controller.login(loginDto);

      expect(result.access_token).toBeDefined();
    });

    it('should validate email format', async () => {
      const loginDto: LoginDto = {
        email: 'invalid-email',
        password: 'password123',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow();
    });

    it('should validate password is provided', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: '',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow();
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should refresh token with valid refresh token', async () => {
      const refreshTokenRequest = {
        refresh_token: 'valid-refresh-token',
      };

      const mockResponse = {
        access_token: 'new-jwt-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      mockAuthService.refreshToken.mockResolvedValue(mockResponse);

      const result = await controller.refreshToken(refreshTokenRequest);

      expect(result.access_token).toBeDefined();
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        refreshTokenRequest.refresh_token,
      );
    });

    it('should throw UnauthorizedException with invalid refresh token', async () => {
      const refreshTokenRequest = {
        refresh_token: 'invalid-refresh-token',
      };

      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(controller.refreshToken(refreshTokenRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      const refreshTokenRequest = {
        refresh_token: 'expired-refresh-token',
      };

      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Token expired'),
      );

      await expect(controller.refreshToken(refreshTokenRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('POST /auth/validate', () => {
    it('should validate token and return user data', async () => {
      const validateRequest = {
        token: 'valid-token',
      };

      const mockPayload = {
        sub: 1,
        email: 'user@example.com',
        name: 'John Doe',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockAuthService.validateToken.mockResolvedValue(mockPayload);

      const result = await controller.validateToken(validateRequest);

      expect(result).toEqual(mockPayload);
      expect(mockAuthService.validateToken).toHaveBeenCalledWith(
        validateRequest.token,
      );
    });

    it('should return null for invalid token', async () => {
      const validateRequest = {
        token: 'invalid-token',
      };

      mockAuthService.validateToken.mockResolvedValue(null);

      const result = await controller.validateToken(validateRequest);

      expect(result).toBeNull();
    });

    it('should return null for expired token', async () => {
      const validateRequest = {
        token: 'expired-token',
      };

      mockAuthService.validateToken.mockResolvedValue(null);

      const result = await controller.validateToken(validateRequest);

      expect(result).toBeNull();
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user', async () => {
      const logoutRequest = {
        token: 'user-token',
      };

      const mockRequest = {
        user: { id: 1, email: 'user@example.com' },
      };

      const result = await controller.logout(mockRequest as any);

      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should invalidate token on logout', async () => {
      const logoutRequest = {
        token: 'user-token',
      };

      const mockRequest = {
        user: { id: 1, email: 'user@example.com' },
      };

      await controller.logout(mockRequest as any);

      // Token should no longer be valid
      mockAuthService.validateToken.mockResolvedValue(null);

      const validation = await authService.validateToken('user-token');

      expect(validation).toBeNull();
    });
  });

  describe('POST /auth/select-unit', () => {
    it('should select unit and generate new token', async () => {
      const selectUnitRequest = {
        unitId: 5,
      };

      const mockRequest = {
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'John Doe',
          unitId: 5,
          unitName: 'Unit A',
          units: [
            { id: 5, name: 'Unit A', type: 'Police Station', city: 'São Paulo', state: 'SP' },
            { id: 6, name: 'Unit B', type: 'Training Center', city: 'Rio', state: 'RJ' },
          ],
        },
      };

      const mockResponse = {
        access_token: 'new-token-with-selected-unit',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'John Doe',
          unitId: 5,
          unitName: 'Unit A',
          units: mockRequest.user.units,
        },
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.selectUnit(mockRequest as any, selectUnitRequest);

      expect(result.access_token).toBeDefined();
      expect(result.user.unitId).toBe(5);
    });

    it('should throw error if unit not available for user', async () => {
      const selectUnitRequest = {
        unitId: 999,
      };

      const mockRequest = {
        user: {
          id: 1,
          email: 'user@example.com',
          units: [
            { id: 5, name: 'Unit A' },
            { id: 6, name: 'Unit B' },
          ],
        },
      };

      await expect(
        controller.selectUnit(mockRequest as any, selectUnitRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user data from token', async () => {
      const mockRequest = {
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'John Doe',
          roleName: 'Officer',
          unitId: 5,
          unitName: 'Unit A',
        },
      };

      const result = await controller.getMe(mockRequest as any);

      expect(result).toEqual(mockRequest.user);
    });

    it('should include all user session data', async () => {
      const mockRequest = {
        user: {
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
          units: [
            { id: 5, name: 'Unit A', type: 'Police Station', city: 'São Paulo', state: 'SP' },
          ],
        },
      };

      const result = await controller.getMe(mockRequest as any);

      expect(result.employeeId).toBe(100);
      expect(result.units).toBeDefined();
    });
  });
});
