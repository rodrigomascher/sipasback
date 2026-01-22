import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
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
}
