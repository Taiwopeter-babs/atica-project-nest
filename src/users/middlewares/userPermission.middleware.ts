/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { PostgresService } from '@src/storage/postgres/postgres.service';
import { NextFunction, Request, Response } from 'express';

const checkDigit = /^[0-9]+$/;



@Injectable()
export default class UserPermissionMiddleware implements NestMiddleware {
    constructor(
        private readonly postgres: PostgresService, 
        private readonly authService: AuthService
    ) {}

  async  use(request: Request,
  response: Response,
  next: NextFunction,
) {
  const { id } = request.params;

  try {
    if (!checkDigit.test(id)) {
      return response
        .status(400)
        .json({ statusCode: 400, message: 'Invalid id' });
    }

    const idInt = parseInt(id, 10);

    const user = await this.postgres.getUserById(idInt);
    if (!user) {
       throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const userEmail = user.email;

    const cookieName = '_atica_session_' + userEmail.split('@')[0];
    const sessionCookie = request.cookies[cookieName];

    await this.authService.checkLogin(sessionCookie);

    return next();

  } catch (error: any) {
    throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
  }
}
}