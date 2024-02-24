import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import {
  validateAddUser,
  validateUserLogin,
} from './middlewares/validateUser.middleware';
import UserPermissionMiddleware from './middlewares/userPermission.middleware';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [StorageModule, AuthModule, CompanyModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // new user
    consumer
      .apply(validateAddUser)
      .forRoutes({ path: '/api/v1/users$', method: RequestMethod.POST });

    consumer
      .apply(validateUserLogin)
      .forRoutes({ path: '/api/v1/users/auth*', method: RequestMethod.POST });

    // protected routes
    consumer
      .apply(UserPermissionMiddleware)
      .forRoutes('/api/v1/users/[0-9]+.+');
  }
}
