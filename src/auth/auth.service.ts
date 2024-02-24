import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FirebaseService } from '../storage/firebase/firebase.service';
import { Request } from 'express';

/**
 * ### Authentication service class
 */
@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getSessionToken(email: string, password: string, request: Request) {
    try {
      const idToken = await this.firebaseService.getUserIdToken(
        email,
        password,
      );

      const sessionCookie = await this.firebaseService.getSessionLoginToken(
        request,
        email,
        idToken,
      );

      return sessionCookie;
    } catch (error) {
      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }
  }

  async checkLogin(sessionCookie: string) {
    try {
      const decoded = await this.firebaseService.checkLogin(sessionCookie);

      return decoded;
    } catch (error) {
      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }
  }

  async logoutUser(sessionCookie: string, firebaseuid: string) {
    try {
      await this.firebaseService.logoutUser(sessionCookie, firebaseuid);

      return true;
    } catch (error) {
      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }
  }
}
