import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp } from 'firebase/app';

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  FirebaseStorage,
} from 'firebase/storage';

@Injectable()
export class FirebaseimageService {
  private storage: FirebaseStorage;

  constructor(private configService: ConfigService) {
    const firebaseConfig = this.configService.get<object>('firebase');
    const firebaseApp = initializeApp(firebaseConfig);
    this.storage = getStorage(firebaseApp);
  }

  async uploadImage(data: Blob, fileName: string, firebaseuid: string) {
    try {
      const imageRef = `${firebaseuid}/${fileName}`;

      const storageRef = ref(this.storage, imageRef);

      const snapshotFile = await uploadBytes(storageRef, data);

      const imageUrl = await getDownloadURL(snapshotFile.ref);

      return imageUrl;
    } catch (error) {
      throw error;
    }
  }
}
