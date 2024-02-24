import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Get,
  Res,
  Req,
  HttpCode,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { CompanyService } from '../company/company.service';
import { AuthService } from '../auth/auth.service';
import { AdminService } from './admin.service';
import { ICreateAdminDto } from './admin.dto';
import fileUpload from 'express-fileupload';
import { PostgresService } from '../storage/postgres/postgres.service';

/**
 * checks if a string contains only digits
 * @param value value to be checked
 */
const checkDigit = (value: string) => /^[0-9]+$/.test(value);

@Controller('/api/v1/administrators')
export class AdminController {
  constructor(
    private readonly userService: UsersService,
    private readonly companyService: CompanyService,
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
    private readonly postgres: PostgresService,
  ) {}

  /**
   *
   * @param adminDto - admin object to be saved
   * @param response response object to set the cookie
   */
  @Post()
  async addAdmin(
    @Body() adminDto: ICreateAdminDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email } = adminDto;

    try {
      // an object of AddUserReturnType is returned
      /**@see {UsersService} */
      const { sessionCookie, ...newAdmin } =
        await this.adminService.addAdmin(adminDto);

      // set unqiue cookie for user
      const cookieName = '_atica_session_' + email.split('@')[0];
      const maxAge = 24 * 1 * 60 * 60 * 1000; // 1 day
      response.cookie(cookieName, sessionCookie, {
        httpOnly: true,
        maxAge: maxAge,
      });

      return { statusCode: 201, ...newAdmin };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/users/:userId/companies')
  async getUserCompanies(@Req() request: Request) {
    try {
      const userId = request.params.userId;

      if (!checkDigit(userId)) {
        throw new HttpException(
          'Invalid id parameters',
          HttpStatus.BAD_REQUEST,
        );
      }

      const userIdInt = Number(userId);

      const user = await this.userService.getUserById(userIdInt);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const userCompanies =
        await this.companyService.getUserCompanies(userIdInt);

      return { statusCode: 200, companies: userCompanies };
    } catch (error: any) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/users/:userId/')
  async getUser(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const user = await this.userService.getUserById(userId);

      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      return user;
    } catch (error: any) {
      throw error;
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
      const admin = await this.adminService.getAdminById(Number(id));
      if (!admin) {
        throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
      }

      const cookieName = '_atica_session_' + admin.email.split('@')[0];
      const sessionCookie = request.cookies[cookieName];

      const firebaseuid = admin.firebaseuid;
      await this.authService.logoutUser(sessionCookie, firebaseuid);

      response.clearCookie(cookieName);

      return {};
    } catch (error: any) {
      throw error;
    }
  }

  @Post(':id/users/:userId/images')
  async uploadImage(@Req() request: Request) {
    const { userId } = request.params;
    const files = request.files;

    try {
      const user = await this.userService.getUserById(Number(userId));
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const { data, name } =
        files.userImageFile as fileUpload.UploadedFile | null;

      const imageUrl = await this.adminService.uploadImageToUser(
        data,
        name,
        user.firebaseuid,
      );
      if (!imageUrl) {
        throw new HttpException('Invalid image format', HttpStatus.BAD_REQUEST);
      }

      await this.postgres.updateUserImage(Number(userId), imageUrl);
      return {
        statusCode: 200,
        message: 'Image upload successful',
        imageUrl: imageUrl,
      };
    } catch (error: any) {
      // error is an http exception
      throw error;
    }
  }
}
