import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { LoggerService, LogLevel, LogContext } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let mockLogger: any;

  beforeEach(async () => {
    // Mock Logger methods
    mockLogger = {
      debug: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    // Patch Logger constructor
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(mockLogger.debug);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);

    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log with different log levels', () => {
    const baseContext: LogContext = {
      action: 'TEST_ACTION',
      module: 'TEST_MODULE',
    };

    it('should log with DEBUG level', () => {
      service.log(baseContext, LogLevel.DEBUG);
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it('should log with INFO level', () => {
      service.log(baseContext, LogLevel.INFO);
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should log with WARN level', () => {
      service.log(baseContext, LogLevel.WARN);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should log with ERROR level', () => {
      service.log(baseContext, LogLevel.ERROR);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should use INFO as default log level', () => {
      service.log(baseContext);
      expect(mockLogger.log).toHaveBeenCalled();
    });
  });

  describe('log context formatting', () => {
    it('should format log with userId and email', () => {
      const context: LogContext = {
        userId: 123,
        email: 'user@example.com',
        action: 'USER_LOGIN',
        module: 'AUTH',
      };

      service.log(context, LogLevel.INFO);

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('123');
      expect(logCall).toContain('user@example.com');
      expect(logCall).toContain('USER_LOGIN');
      expect(logCall).toContain('AUTH');
    });

    it('should format log with details', () => {
      const context: LogContext = {
        action: 'UPDATE_PERSON',
        module: 'PERSONS',
        details: { personId: 456, field: 'email' },
      };

      service.log(context, LogLevel.INFO);

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('UPDATE_PERSON');
      expect(logCall).toContain('personId');
    });

    it('should format log with duration', () => {
      const context: LogContext = {
        action: 'DB_QUERY',
        module: 'DATABASE',
        duration: 150,
      };

      service.log(context, LogLevel.INFO);

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('150');
    });

    it('should handle context with only required fields', () => {
      const context: LogContext = {
        action: 'SIMPLE_ACTION',
        module: 'SIMPLE_MODULE',
      };

      service.log(context, LogLevel.DEBUG);

      const logCall = mockLogger.debug.mock.calls[0][0];
      expect(logCall).toContain('SIMPLE_ACTION');
      expect(logCall).toContain('SIMPLE_MODULE');
      expect(logCall).toContain('Anonymous');
    });
  });

  describe('logError', () => {
    it('should log error with Error object', () => {
      const context: LogContext = {
        action: 'FAILED_OPERATION',
        module: 'TEST_MODULE',
        userId: 123,
      };

      const error = new Error('Something went wrong');

      service.logError(context, error);

      const errorCall = mockLogger.error.mock.calls[0][0];
      expect(errorCall).toContain('ERROR');
      expect(errorCall).toContain('Something went wrong');
      expect(errorCall).toContain('123');
    });

    it('should log error with string error message', () => {
      const context: LogContext = {
        action: 'OPERATION_FAILED',
        module: 'MODULE',
      };

      const errorMessage = 'Custom error message';

      service.logError(context, errorMessage);

      const errorCall = mockLogger.error.mock.calls[0][0];
      expect(errorCall).toContain('Custom error message');
    });

    it('should include stack trace when provided', () => {
      const context: LogContext = {
        action: 'ERROR_WITH_STACK',
        module: 'MODULE',
      };

      const error = new Error('Error with stack');
      const stackTrace = 'at testFunction() :1:1';

      service.logError(context, error, stackTrace);

      const errorCall = mockLogger.error.mock.calls[0][0];
      expect(errorCall).toContain('testFunction');
    });

    it('should extract stack trace from Error object', () => {
      const context: LogContext = {
        action: 'ERROR_ACTION',
        module: 'MODULE',
      };

      const error = new Error('Test error');

      service.logError(context, error);

      const errorCall = mockLogger.error.mock.calls[0][0];
      expect(errorCall).toContain('ERROR');
    });
  });

  describe('logRequest', () => {
    it('should log HTTP request with userId', () => {
      service.logRequest(123, 'GET', '/api/users');

      const logCall = mockLogger.debug.mock.calls[0][0];
      expect(logCall).toContain('HTTP_REQUEST');
      expect(logCall).toContain('GET');
      expect(logCall).toContain('/api/users');
      expect(logCall).toContain('123');
    });

    it('should log HTTP request without userId', () => {
      service.logRequest(undefined, 'POST', '/api/auth/login');

      const logCall = mockLogger.debug.mock.calls[0][0];
      expect(logCall).toContain('HTTP_REQUEST');
      expect(logCall).toContain('POST');
      expect(logCall).toContain('/api/auth/login');
    });

    it('should log various HTTP methods', () => {
      const methods = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'];

      for (const method of methods) {
        mockLogger.debug.mockClear();
        service.logRequest(1, method, '/api/test');
        const logCall = mockLogger.debug.mock.calls[0][0];
        expect(logCall).toContain(method);
      }
    });
  });

  describe('logResponse', () => {
    it('should log HTTP response with success code', () => {
      service.logResponse(123, 'GET', '/api/users', 200, 45);

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('HTTP_RESPONSE');
      expect(logCall).toContain('200');
      expect(logCall).toContain('45');
    });

    it('should log HTTP response with error code', () => {
      service.logResponse(456, 'POST', '/api/users', 400, 120);

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('HTTP_RESPONSE');
      expect(logCall).toContain('400');
      expect(logCall).toContain('120');
    });

    it('should log HTTP response with 500 status', () => {
      service.logResponse(789, 'DELETE', '/api/users/1', 500, 200);

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('500');
    });

    it('should log response without userId', () => {
      service.logResponse(undefined, 'GET', '/api/public', 200, 10);

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('HTTP_RESPONSE');
      expect(logCall).toContain('GET');
    });
  });

  describe('logAuth', () => {
    it('should log successful login with INFO level', () => {
      service.logAuth('user@example.com', true);

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('LOGIN_SUCCESS');
      expect(logCall).toContain('user@example.com');
    });

    it('should log failed login with WARN level', () => {
      service.logAuth('user@example.com', false);

      const logCall = mockLogger.warn.mock.calls[0][0];
      expect(logCall).toContain('LOGIN_FAILED');
      expect(logCall).toContain('user@example.com');
    });

    it('should include additional details in login log', () => {
      service.logAuth('admin@test.com', true, { ip: '192.168.1.1', deviceId: 'dev123' });

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('admin@test.com');
    });
  });

  describe('logDatabase', () => {
    it('should log database INSERT operation', () => {
      service.logDatabase('INSERT', 'users', 123);

      const logCall = mockLogger.debug.mock.calls[0][0];
      expect(logCall).toContain('DB_INSERT');
      expect(logCall).toContain('users');
      expect(logCall).toContain('DATABASE');
    });

    it('should log database SELECT operation', () => {
      service.logDatabase('SELECT', 'persons', 456);

      const logCall = mockLogger.debug.mock.calls[0][0];
      expect(logCall).toContain('DB_SELECT');
      expect(logCall).toContain('persons');
    });

    it('should log database UPDATE operation', () => {
      service.logDatabase('UPDATE', 'genders', 789);

      const logCall = mockLogger.debug.mock.calls[0][0];
      expect(logCall).toContain('DB_UPDATE');
      expect(logCall).toContain('genders');
    });

    it('should log database DELETE operation', () => {
      service.logDatabase('DELETE', 'roles', 999);

      const logCall = mockLogger.debug.mock.calls[0][0];
      expect(logCall).toContain('DB_DELETE');
      expect(logCall).toContain('roles');
    });

    it('should include additional details in database log', () => {
      service.logDatabase('INSERT', 'users', 123, { recordsInserted: 5 });

      const logCall = mockLogger.debug.mock.calls[0][0];
      expect(logCall).toContain('users');
      expect(logCall).toContain('DATABASE');
    });
  });

  describe('logAudit', () => {
    it('should log audit CREATE action', () => {
      service.logAudit(123, 'CREATE', 'Person', { personId: 456, name: 'John' });

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('AUDIT_CREATE');
      expect(logCall).toContain('123');
      expect(logCall).toContain('Person');
    });

    it('should log audit UPDATE action', () => {
      service.logAudit(123, 'UPDATE', 'User', { userId: 789, email: 'new@email.com' });

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('AUDIT_UPDATE');
      expect(logCall).toContain('789');
    });

    it('should log audit DELETE action', () => {
      service.logAudit(123, 'DELETE', 'Unit', { unitId: 555 });

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('AUDIT_DELETE');
      expect(logCall).toContain('Unit');
    });

    it('should include changes in audit log', () => {
      service.logAudit(456, 'UPDATE', 'Department', {
        departmentId: 789,
        name: 'Engineering',
        budget: 100000,
      });

      const logCall = mockLogger.log.mock.calls[0][0];
      expect(logCall).toContain('AUDIT_UPDATE');
      expect(logCall).toContain('AUDIT');
    });
  });

  describe('LogLevel enum', () => {
    it('should have all required log levels', () => {
      expect(LogLevel.DEBUG).toBe('DEBUG');
      expect(LogLevel.INFO).toBe('INFO');
      expect(LogLevel.WARN).toBe('WARN');
      expect(LogLevel.ERROR).toBe('ERROR');
    });
  });

  describe('LogContext interface', () => {
    it('should accept context with all optional fields', () => {
      const context: LogContext = {
        userId: 123,
        email: 'test@example.com',
        action: 'TEST_ACTION',
        module: 'TEST_MODULE',
        details: { key: 'value' },
        timestamp: new Date(),
        duration: 100,
      };

      service.log(context, LogLevel.INFO);

      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should accept context with only required fields', () => {
      const context: LogContext = {
        action: 'MINIMAL_ACTION',
        module: 'MINIMAL_MODULE',
      };

      service.log(context, LogLevel.INFO);

      expect(mockLogger.log).toHaveBeenCalled();
    });
  });
});
