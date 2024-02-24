/* eslint-disable prettier/prettier */
export interface ICreateUserDto {
  readonly email: string;
  readonly fullname: string;
  readonly password: string;
  readonly firebaseuid: string;
}

export interface IGetUserDto {
  readonly id: string;
  readonly email: string;
  readonly fullname: string;
  readonly firebaseuid: string;
  readonly imageurl: string;
  readonly createdat: Date;
  readonly updatedat: Date;
}

