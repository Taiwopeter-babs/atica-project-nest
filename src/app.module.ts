import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import configuration from 'config/configuration';

@Module({
  imports: [
    UsersModule,
    AdminModule,
    StorageModule,
    ConfigModule.forRoot({
      load: [configuration],
      cache: true,
    }),
    AuthModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
