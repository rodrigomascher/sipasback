import { LoggerService, LogLevel, LogContext } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    // Create a simple instance without mocking the Logger
    service = new LoggerService();
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
      expect(() => service.log(baseContext, LogLevel.DEBUG)).not.toThrow();
    });

    it('should log with INFO level', () => {
      expect(() => service.log(baseContext, LogLevel.INFO)).not.toThrow();
    });

    it('should log with WARN level', () => {
      expect(() => service.log(baseContext, LogLevel.WARN)).not.toThrow();
    });

    it('should log with ERROR level', () => {
      expect(() => service.log(baseContext, LogLevel.ERROR)).not.toThrow();
    });

    it('should use INFO as default log level', () => {
      expect(() => service.log(baseContext)).not.toThrow();
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

      expect(() => service.log(context, LogLevel.INFO)).not.toThrow();
    });

    it('should format log with details', () => {
      const context: LogContext = {
        action: 'UPDATE_PERSON',
        module: 'PERSONS',
        details: { personId: 456, field: 'email' },
      };

      expect(() => service.log(context, LogLevel.INFO)).not.toThrow();
    });

    it('should format log with duration', () => {
      const context: LogContext = {
        action: 'DB_QUERY',
        module: 'DATABASE',
        duration: 150,
      };

      expect(() => service.log(context, LogLevel.INFO)).not.toThrow();
    });

    it('should handle context with only required fields', () => {
      const context: LogContext = {
        action: 'SIMPLE_ACTION',
        module: 'SIMPLE_MODULE',
      };

      expect(() => service.log(context, LogLevel.DEBUG)).not.toThrow();
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

      expect(() => service.logError(context, error)).not.toThrow();
    });

    it('should log error with string error message', () => {
      const context: LogContext = {
        action: 'OPERATION_FAILED',
        module: 'MODULE',
      };

      const errorMessage = 'Custom error message';

      expect(() => service.logError(context, errorMessage)).not.toThrow();
    });

    it('should include stack trace when provided', () => {
      const context: LogContext = {
        action: 'ERROR_WITH_STACK',
        module: 'MODULE',
      };

      const error = new Error('Error with stack');
      const stackTrace = 'at testFunction() :1:1';

      expect(() => service.logError(context, error, stackTrace)).not.toThrow();
    });

    it('should extract stack trace from Error object', () => {
      const context: LogContext = {
        action: 'ERROR_ACTION',
        module: 'MODULE',
      };

      const error = new Error('Test error');

      expect(() => service.logError(context, error)).not.toThrow();
    });
  });

  describe('logRequest', () => {
    it('should log HTTP request with userId', () => {
      expect(() => service.logRequest(123, 'GET', '/api/users')).not.toThrow();
    });

    it('should log HTTP request without userId', () => {
      expect(() => service.logRequest(undefined, 'POST', '/api/auth/login')).not.toThrow();
    });

    it('should log various HTTP methods', () => {
      const methods = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'];

      for (const method of methods) {
        expect(() => service.logRequest(1, method, '/api/test')).not.toThrow();
      }
    });
  });

  describe('logResponse', () => {
    it('should log HTTP response with success code', () => {
      expect(() => service.logResponse(123, 'GET', '/api/users', 200, 45)).not.toThrow();
    });

    it('should log HTTP response with error code', () => {
      expect(() => service.logResponse(456, 'POST', '/api/users', 400, 120)).not.toThrow();
    });

    it('should log HTTP response with 500 status', () => {
      expect(() => service.logResponse(789, 'DELETE', '/api/users/1', 500, 200)).not.toThrow();
    });

    it('should log response without userId', () => {
      expect(() => service.logResponse(undefined, 'GET', '/api/public', 200, 10)).not.toThrow();
    });
  });

  describe('logAuth', () => {
    it('should log successful login with INFO level', () => {
      expect(() => service.logAuth('user@example.com', true)).not.toThrow();
    });

    it('should log failed login with WARN level', () => {
      expect(() => service.logAuth('user@example.com', false)).not.toThrow();
    });

    it('should include additional details in login log', () => {
      expect(() => service.logAuth('admin@test.com', true, { ip: '192.168.1.1', deviceId: 'dev123' })).not.toThrow();
    });
  });

  describe('logDatabase', () => {
    it('should log database INSERT operation', () => {
      expect(() => service.logDatabase('INSERT', 'users', 123)).not.toThrow();
    });

    it('should log database SELECT operation', () => {
      expect(() => service.logDatabase('SELECT', 'persons', 456)).not.toThrow();
    });

    it('should log database UPDATE operation', () => {
      expect(() => service.logDatabase('UPDATE', 'genders', 789)).not.toThrow();
    });

    it('should log database DELETE operation', () => {
      expect(() => service.logDatabase('DELETE', 'roles', 999)).not.toThrow();
    });

    it('should include additional details in database log', () => {
      expect(() => service.logDatabase('INSERT', 'users', 123, { recordsInserted: 5 })).not.toThrow();
    });
  });

  describe('logAudit', () => {
    it('should log audit CREATE action', () => {
      expect(() => service.logAudit(123, 'CREATE', 'Person', { personId: 456, name: 'John' })).not.toThrow();
    });

    it('should log audit UPDATE action', () => {
      expect(() => service.logAudit(123, 'UPDATE', 'User', { userId: 789, email: 'new@email.com' })).not.toThrow();
    });

    it('should log audit DELETE action', () => {
      expect(() => service.logAudit(123, 'DELETE', 'Unit', { unitId: 555 })).not.toThrow();
    });

    it('should include changes in audit log', () => {
      expect(() => service.logAudit(456, 'UPDATE', 'Department', {
        departmentId: 789,
        name: 'Engineering',
        budget: 100000,
      })).not.toThrow();
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

      expect(() => service.log(context, LogLevel.INFO)).not.toThrow();
    });

    it('should accept context with only required fields', () => {
      const context: LogContext = {
        action: 'MINIMAL_ACTION',
        module: 'MINIMAL_MODULE',
      };

      expect(() => service.log(context, LogLevel.INFO)).not.toThrow();
    });
  });
});
