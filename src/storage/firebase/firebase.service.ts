import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';

import admin, { ServiceAccount } from 'firebase-admin';

import { Request } from 'express';

// firebase service account
import * as serviceAccountJson from '@root/config/serviceAccountKey.json';

/**
 * ### Firebase Service
 */
@Injectable()
export class FirebaseService {
  serviceAccount = serviceAccountJson as ServiceAccount;
  private adminApp: admin.app.App;
  private clientApp: FirebaseApp;
  private auth: Auth;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (!this.adminApp) {
      this.adminApp = admin.initializeApp({
        credential: admin.credential.cert(this.serviceAccount),
        databaseURL: this.configService.get<string>(
          'firebase.firebaseDatabase',
        ),
      });
    }

    if (!this.clientApp) {
      this.clientApp = initializeApp(
        this.configService.get<object>('firebase'),
      );
      this.auth = getAuth(this.clientApp);
    }
  }

  async addUser(email: string, password: string): Promise<string[]> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      const user = userCredential.user;
      const firebaseuid = user.uid;

      const idToken = await user.getIdToken();

      // get session cookie
      const sessionCookie = await this.loginUser(idToken);

      return [sessionCookie, firebaseuid];
    } catch (error: any) {
      throw new Error(error.message);
    }

    // return [sessionCookie, firebaseuid]
  }

  async getSessionLoginToken(
    request: Request,
    email: string,
    idToken?: string,
  ) {
    let newSessionCookie: string;

    try {
      const sessionCookieName = '_atica_session_' + email.split('@')[0];
      const idCookieName = '_atica_' + email.split('@')[0];

      const sessionCookie = request.cookies[sessionCookieName] as string;
      const idTokenCookie = request.cookies[idCookieName];

      const token = idToken as string;
      // create a new session
      if (
        (!sessionCookie && !idTokenCookie) ||
        (!sessionCookie && idTokenCookie)
      ) {
        newSessionCookie = await this.loginUser(token);

        return newSessionCookie;
      }

      // validate session cookie
      await this.checkLogin(sessionCookie);

      return sessionCookie;
    } catch (error: any) {
      throw error;
    }
  }

  async getUserIdToken(email: string, password: string): Promise<string> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      const idToken = await userCredential.user.getIdToken();

      return idToken;
    } catch (error: any) {
      throw new Error('Not Found');
    }
  }

  async loginUser(idToken: string): Promise<string> {
    try {
      const expiresIn = 24 * 1 * 60 * 60 * 1000; // 1 day

      const sessionCookie = await this.adminApp
        .auth()
        .createSessionCookie(idToken, { expiresIn: expiresIn });

      return sessionCookie;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async checkLogin(sessionCookie: string) {
    const checkRevoked = true;
    try {
      const payload = await this.adminApp
        .auth()
        .verifySessionCookie(sessionCookie, checkRevoked);
      return payload;
    } catch (error) {
      throw new Error('Unauthorized access');
    }
  }

  async logoutUser(
    sessionCookie: string,
    firebaseuid: string,
  ): Promise<boolean> {
    try {
      await this.checkLogin(sessionCookie);

      await this.adminApp.auth().revokeRefreshTokens(firebaseuid);

      return true;
    } catch (error) {
      throw new Error('Unauthorized access');
    }
  }
}
