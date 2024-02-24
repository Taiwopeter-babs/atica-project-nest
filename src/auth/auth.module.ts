import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
