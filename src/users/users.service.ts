import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PostgresService } from '../storage/postgres/postgres.service';
import { FirebaseService } from '../storage/firebase/firebase.service';
import { ICreateUserDto, IGetUserDto } from './user.dto';

// return type for adding a user
export type AddUserReturnType<T> = Promise<
  Omit<T, 'password'> & Record<'sessionCookie', string>
>;

/**
 * ### User service class
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly postgres: PostgresService,
    private readonly firebase: FirebaseService,
  ) {}

  async addUser(data: ICreateUserDto): Promise<AddUserReturnType<IGetUserDto>> {
    try {
      const user = await this.postgres.getUserByEmail(data.email);
      if (user) {
        throw new HttpException(
          'User account already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      const { password, ...rest } = data;

      const [sessionCookie, firebaseuid] = await this.firebase.addUser(
        data.email,
        password,
      );

      const dataForDatabase = { ...rest, firebaseuid };

      const newUser = await this.postgres.addUser(dataForDatabase);

      return { ...newUser, sessionCookie };
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<IGetUserDto> {
    try {
      const user = await this.postgres.getUserByEmail(email);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: number): Promise<IGetUserDto> {
    try {
      const user = await this.postgres.getUserById(id);

      return user;
    } catch (error) {
      throw error;
    }
  }
}
