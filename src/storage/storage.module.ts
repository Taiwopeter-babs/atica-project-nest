import { Module } from '@nestjs/common';
import { PostgresService } from './postgres/postgres.service';
import { FirebaseService } from './firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseimageService } from './firebaseimage/firebaseimage.service';

@Module({
  imports: [ConfigModule],
  providers: [PostgresService, FirebaseService, FirebaseimageService],
  exports: [PostgresService, FirebaseService, FirebaseimageService],
})
export class StorageModule {}
