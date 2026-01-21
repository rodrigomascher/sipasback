import { Injectable, Logger } from '@nestjs/common';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  userId?: number;
  email?: string;
  action: string;
  module: string;
  details?: Record<string, any>;
  timestamp?: Date;
  duration?: number;
}

@Injectable()
export class LoggerService {
  private logger = new Logger('SIPAS');

  /**
   * Log estruturado com contexto padronizado
   */
  log(context: LogContext, level: LogLevel = LogLevel.INFO) {
    const timestamp = context.timestamp || new Date();
    const logMessage = this.formatLog(context, level, timestamp);

    switch (level) {
      case LogLevel.DEBUG:
        this.logger.debug(logMessage);
        break;
      case LogLevel.INFO:
        this.logger.log(logMessage);
        break;
      case LogLevel.WARN:
        this.logger.warn(logMessage);
        break;
      case LogLevel.ERROR:
        this.logger.error(logMessage);
        break;
    }

    // Se em produção, você poderia enviar para um serviço de log externo aqui
    // ex: Sentry, DataDog, ELK, etc
  }

  /**
   * Log de erro com stack trace
   */
  logError(
    context: LogContext,
    error: Error | string,
    stackTrace?: string,
  ) {
    const timestamp = new Date();
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stack = stackTrace || (error instanceof Error ? error.stack : '');

    const logMessage = `
    [${timestamp.toISOString()}] ERROR | ${context.module} | ${context.action}
    User: ${context.userId || 'Anonymous'} (${context.email || 'N/A'})
    Message: ${errorMessage}
    Details: ${JSON.stringify(context.details || {})}
    Stack: ${stack}
    `;

    this.logger.error(logMessage);
  }

  /**
   * Log de entrada em um controller
   */
  logRequest(userId: number | undefined, method: string, path: string) {
    this.log(
      {
        action: 'HTTP_REQUEST',
        module: 'HTTP',
        userId,
        details: { method, path },
      },
      LogLevel.DEBUG,
    );
  }

  /**
   * Log de saída de um controller
   */
  logResponse(
    userId: number | undefined,
    method: string,
    path: string,
    statusCode: number,
    duration: number,
  ) {
    this.log(
      {
        action: 'HTTP_RESPONSE',
        module: 'HTTP',
        userId,
        details: { method, path, statusCode },
        duration,
      },
      LogLevel.INFO,
    );
  }

  /**
   * Log de autenticação
   */
  logAuth(email: string, success: boolean, details?: Record<string, any>) {
    this.log(
      {
        action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
        module: 'AUTH',
        email,
        details: { ...details, success },
      },
      success ? LogLevel.INFO : LogLevel.WARN,
    );
  }

  /**
   * Log de operação de banco de dados
   */
  logDatabase(
    action: string,
    table: string,
    userId: number | undefined,
    details?: Record<string, any>,
  ) {
    this.log(
      {
        action: `DB_${action}`,
        module: 'DATABASE',
        userId,
        details: { table, ...details },
      },
      LogLevel.DEBUG,
    );
  }

  /**
   * Log de ação sensível (auditoria)
   */
  logAudit(
    userId: number,
    action: string,
    resource: string,
    changes?: Record<string, any>,
  ) {
    this.log(
      {
        action: `AUDIT_${action}`,
        module: 'AUDIT',
        userId,
        details: { resource, changes },
      },
      LogLevel.INFO,
    );
  }

  /**
   * Formata a mensagem de log
   */
  private formatLog(
    context: LogContext,
    level: LogLevel,
    timestamp: Date,
  ): string {
    const userInfo =
      context.userId || context.email
        ? `${context.userId || 'N/A'} (${context.email || 'N/A'})`
        : 'Anonymous';

    const details = context.details
      ? JSON.stringify(context.details)
      : 'No details';

    const duration = context.duration ? ` | Duration: ${context.duration}ms` : '';

    return `
[${timestamp.toISOString()}] ${level} | ${context.module} | ${context.action}
User: ${userInfo}
Details: ${details}${duration}
    `.trim();
  }
}
