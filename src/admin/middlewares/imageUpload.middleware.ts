import { NextFunction, Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

@Injectable()
export default class ImageUploadMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    const files = request.files;

    try {
      if (!files) {
        return response.status(400).json({
          statusCode: 400,
          message: 'No files were uploaded',
        });
      }

      // The name of the input field for the file should be strictly 'userImageFile'
      const userImageFile =
        files.userImageFile as fileUpload.UploadedFile | null;

      if (!userImageFile) {
        return response.status(400).json({
          statusCode: 400,
          message: 'Image filename field is invalid',
        });
      }

      return next();
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
