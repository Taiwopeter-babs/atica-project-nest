import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as mime from 'mime-types';

import { PostgresService } from '../storage/postgres/postgres.service';
import { FirebaseService } from '../storage/firebase/firebase.service';

import { ICreateAdminDto, IGetAdminDto } from './admin.dto';
import { AddUserReturnType } from '../users/users.service';

import { FirebaseimageService } from '../storage/firebaseimage/firebaseimage.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly postgres: PostgresService,
    private readonly firebase: FirebaseService,
    private readonly firebaseImage: FirebaseimageService,
  ) {}

  async addAdmin(
    data: ICreateAdminDto,
  ): Promise<AddUserReturnType<IGetAdminDto>> {
    try {
      // check if admin exists
      const admin = await this.postgres.getAdminByEmail(data.email);
      if (admin) {
        throw new HttpException(
          'Admin account already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      const { password, ...rest } = data;

      const [sessionCookie, firebaseuid] = await this.firebase.addUser(
        data.email,
        password,
      );

      const dataForDatabase = { ...rest, firebaseuid };

      const newAdmin = await this.postgres.addAdmin(dataForDatabase);

      return { ...newAdmin, sessionCookie };
    } catch (error) {
      throw error;
    }
  }

  async getAdminByEmail(email: string): Promise<IGetAdminDto> {
    try {
      const admin = await this.postgres.getAdminByEmail(email);
      if (!admin) {
        throw new HttpException(
          'Admin account not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return admin;
    } catch (error) {
      throw error;
    }
  }

  async getAdminById(id: number): Promise<IGetAdminDto> {
    try {
      const admin = await this.postgres.getAdminById(id);
      if (!admin) return null;

      return admin;
    } catch (error) {
      throw error;
    }
  }

  async uploadImageToUser(
    imageFile: Buffer,
    fileName: string,
    firebaseuid: string,
  ) {
    try {
      const imageBlob = this.convertImageToBlob(imageFile, fileName);

      if (!imageBlob) {
        return null;
      }

      const imageUrl = await this.firebaseImage.uploadImage(
        imageBlob,
        fileName,
        firebaseuid,
      );
      console.log(imageUrl);

      return imageUrl;
    } catch (error) {
      console.log(error);

      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ### Converts a file to `Blob` type for upload
   * - images are validated for allowed mimetypes: `[image/jpeg, image/png]`
   * @returns {Blob | null}
   */
  private convertImageToBlob(data: Buffer, fileName: string): Blob | null {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const checkImageExtension = /\.+(jpg|JPG|jpeg|JPEG|png|PNG)$/g;

    const mimeType = mime.lookup(fileName);
    console.log(mimeType);

    if (
      !mimeType ||
      allowedImageTypes.indexOf(mimeType) === -1 ||
      !checkImageExtension.test(fileName)
    ) {
      return null;
    }

    const imageBlob = new Blob([data], { type: 'image/jpeg' });
    console.log(imageBlob);

    return imageBlob;
  }
}
