import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { StorageModule } from '../storage/storage.module';
import { CompanyController } from './company.controller';
import UserPermissionMiddleware from '../users/middlewares/userPermission.middleware';
import AddCompanyMiddleware from '../users/middlewares/addCompany.middleware';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserPermissionMiddleware, AddCompanyMiddleware).forRoutes({
      path: '/api/v1/companies',
      method: RequestMethod.POST,
    });
  }
}
