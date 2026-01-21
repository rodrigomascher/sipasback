import {
  Injectable,
  NestMiddleware,
  Inject,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(LoggerService) private loggerService: LoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const userId = (req as any).user?.sub;

    // Log da requisição
    this.loggerService.logRequest(
      userId,
      req.method,
      req.path,
    );

    // Interceptar a resposta
    const originalSend = res.send;
    res.send = function (data: any) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log da resposta
      this.loggerService.logResponse(
        userId,
        req.method,
        req.path,
        statusCode,
        duration,
      );

      return originalSend.call(this, data);
    }.bind(this);

    next();
  }
}
