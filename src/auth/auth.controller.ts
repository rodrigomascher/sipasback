import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SelectUnitDto } from './dto/select-unit.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoggerService } from '../common/logger/logger.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private logger: LoggerService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and obtain JWT token with session data' })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Token contains user session information.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );

      if (!user) {
        this.logger.logAuth(loginDto.email, false, {
          reason: 'Invalid credentials',
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      const result = this.authService.login(user);
      this.logger.logAuth(loginDto.email, true, {
        userId: user.id,
        unitId: user.unitId,
      });
      return result;
    } catch (error) {
      this.logger.logError(
        {
          email: loginDto.email,
          action: 'login',
          module: 'auth',
          timestamp: new Date(),
        },
        error,
      );
      throw error;
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data',
  })
  async register(@Body() loginDto: LoginDto) {
    try {
      // TODO: Implement registration logic with validations
      const user = {
        id: 1,
        email: loginDto.email,
        name: 'New User',
        employeeId: null,
        unitId: 1,
        unitName: 'headquarters',
        unitType: 'Branch',
        departmentId: 1,
        departmentName: 'General Administration',
        roleId: null,
        roleName: 'User',
        isTechnician: false,
        isArmoredUnit: false,
        city: 'São Paulo',
        state: 'SP',
      };
      const result = this.authService.login(user);
      this.logger.logAudit(user.id, 'CREATE', 'user', { email: user.email });
      return result;
    } catch (error) {
      this.logger.logError(
        {
          email: loginDto.email,
          action: 'register',
          module: 'auth',
          timestamp: new Date(),
        },
        error,
      );
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Req() req: any) {
    // Logout logic can be implemented here if needed
    return { message: 'Logged out successfully' };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() body: { refresh_token: string }) {
    try {
      const result = await this.authService.refreshToken(body.refresh_token);
      return result;
    } catch (error) {
      this.logger.logError({
        action: 'refresh-token',
        module: 'auth',
        timestamp: new Date(),
      }, error);
      throw error;
    }
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  async validateToken(@Body() body: { token: string }) {
    try {
      const result = await this.authService.validateToken(body.token);
      return result;
    } catch (error) {
      this.logger.logError({
        action: 'validate-token',
        module: 'auth',
        timestamp: new Date(),
      }, error);
      throw error;
    }
  }

  @Post('select-unit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select unit and get new JWT token with unit in payload' })
  @ApiResponse({
    status: 200,
    description: 'Unit selected. New token generated with unit in payload.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid unit ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async selectUnit(@Body() selectUnitDto: SelectUnitDto, @Req() req: any) {
    try {
      // Obter usuário do JWT atual
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No token provided');
      }

      const token = authHeader.substring(7);
      const user = this.authService.getUserFromToken(token);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      console.log('[SELECT-UNIT] Attempting to select unit:', {
        userId: user.id,
        unitId: selectUnitDto.unitId,
        tokenUser: user,
      });

      // Obter dados da unidade selecionada
      const result = await this.authService.selectUnit(user, selectUnitDto.unitId);

      this.logger.logAudit(user.id, 'SELECT_UNIT', 'unit', {
        unitId: selectUnitDto.unitId,
      });

      return result;
    } catch (error) {
      console.error('[SELECT-UNIT] Error:', error);
      this.logger.logError(
        {
          action: 'select-unit',
          module: 'auth',
          timestamp: new Date(),
        },
        error,
      );
      throw error;
    }
  }

  @Post('get-me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user data from token' })
  @ApiResponse({ status: 200, description: 'User data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@Req() req: any) {
    return req.user;
  }
}
