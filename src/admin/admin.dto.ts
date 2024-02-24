/* eslint-disable prettier/prettier */
export interface ICreateAdminDto {
  readonly email: string;
  readonly fullname: string;
  readonly password: string;
  readonly firebaseuid: string;
}

export interface IGetAdminDto {
  readonly id: string;
  readonly email: string;
  readonly fullname: string;
  readonly firebaseuid: string;
  readonly isadmin: boolean;
  readonly createdat: Date;
  readonly updatedat: Date;
}

