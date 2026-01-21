import { UnauthorizedException, Injectable } from '@nestjs/common';

@Injectable()
export class AuthExceptionFilter {
  static getAuthException(message: string) {
    return new UnauthorizedException({
      statusCode: 401,
      message,
      error: 'Unauthorized',
    });
  }
}
