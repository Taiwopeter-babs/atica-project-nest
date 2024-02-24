/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { PostgresService } from '@src/storage/postgres/postgres.service';
import { NextFunction, Request, Response } from 'express';



const checkDigit = (value: string) => /^[0-9]+$/.test(value);



@Injectable()
export default class AdminPermissionMiddleware implements NestMiddleware {
    constructor(
        private readonly postgres: PostgresService, 
        private readonly authService: AuthService
    ) {}

  async  use(request: Request,
  response: Response,
  next: NextFunction,
) {
  const id = request.params.id;

  try {
    if (!checkDigit(id)) {
      return response
        .status(400)
        .json({ statusCode: 400, message: 'Invalid id' });
    }

    const idInt = parseInt(id, 10);

    const admin = await this.postgres.getAdminById(idInt);
    if (!admin) {
       throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }

    const adminEmail = admin.email;

    const cookieName = '_atica_session_' + adminEmail.split('@')[0];
    const sessionCookie = request.cookies[cookieName];

    await this.authService.checkLogin(sessionCookie);

    return next();

  } catch (error: any) {
    throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
  }
}
}