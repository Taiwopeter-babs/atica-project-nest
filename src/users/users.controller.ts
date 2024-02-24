import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Get,
  Res,
  Req,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ICreateUserDto } from './user.dto';
import { Request, Response } from 'express';
import { CompanyService } from '../company/company.service';
import { AuthService } from '../auth/auth.service';

@Controller('/api/v1/users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly companyService: CompanyService,
    private readonly authService: AuthService,
  ) {}

  /**
   *
   * @param userDto - user object to be saved
   * @param response response object to set the cookie
   */
  @Post()
  async addUser(
    @Body() userDto: ICreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email } = userDto;

    try {
      // an object of AddUserReturnType is returned
      /**@see {UsersService} */
      const { sessionCookie, ...newUser } =
        await this.userService.addUser(userDto);

      // set unqiue cookie for user
      const cookieName = '_atica_session_' + email.split('@')[0];
      const maxAge = 24 * 1 * 60 * 60 * 1000; // 1 day
      response.cookie(cookieName, sessionCookie, {
        httpOnly: true,
        maxAge: maxAge,
      });

      return { statusCode: 201, ...newUser };
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/companies')
  async getUserCompanies(@Param('id') id: string) {
    try {
      if (!/^[0-9]+$/.test(id)) {
        throw new HttpException('Invalid id parameter', HttpStatus.BAD_REQUEST);
      }

      const userId = Number(id);
      const userCompanies = await this.companyService.getUserCompanies(userId);

      return { statusCode: 200, ...userCompanies };
    } catch (error: any) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('auth/login')
  async loginUser(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = request.body;

    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const sessionCookie = await this.authService.getSessionToken(
        email,
        password,
        request,
      );

      // set unqiue cookie name for user
      const cookieName = '_atica_session_' + email.split('@')[0];

      const maxAge = 24 * 1 * 60 * 60 * 1000; // 1 day
      const options = { httpOnly: true, secure: true, maxAge: maxAge };

      response.cookie(cookieName, sessionCookie, options);

      return { statusCode: 200, message: 'Login successful' };
    } catch (error: any) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/auth/logout')
  @HttpCode(204)
  async logoutUser(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const id = request.params.id;
    if (!/^[0-9]+$/.test(id)) {
      throw new HttpException('Invalid id parameter', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.userService.getUserById(Number(id));
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const cookieName = '_atica_session_' + user.email.split('@')[0];
      const sessionCookie = request.cookies[cookieName];

      const firebaseuid = user.firebaseuid as string;
      await this.authService.logoutUser(sessionCookie, firebaseuid);

      response.clearCookie(cookieName);

      return {};
    } catch (error: any) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
