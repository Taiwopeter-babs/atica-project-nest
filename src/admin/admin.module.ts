import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { StorageModule } from '../storage/storage.module';

import {
  validateAddUser,
  validateUserLogin,
} from '../users/middlewares/validateUser.middleware';

import { AuthModule } from '../auth/auth.module';
import AdminPermissionMiddleware from './middlewares/addPermission.middleware';
import { CompanyModule } from '../company/company.module';
import ImageUploadMiddleware from './middlewares/imageUpload.middleware';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [StorageModule, AuthModule, CompanyModule, UsersModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // new user
    consumer.apply(validateAddUser).forRoutes({
      path: '/api/v1/administrators$',
      method: RequestMethod.POST,
    });

    consumer.apply(validateUserLogin).forRoutes({
      path: '/api/v1/administrators/:id/auth/login',
      method: RequestMethod.POST,
    });

    // protected routes
    consumer
      .apply(AdminPermissionMiddleware)
      .forRoutes('/api/v1/administrators/:id/*');

    // image validation middleware
    consumer
      .apply(ImageUploadMiddleware)
      .forRoutes('/api/v1/administrators/:id/*images');
  }
}
