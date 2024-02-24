/* eslint-disable prettier/prettier */
export interface ICreateCompanyDto {
  readonly name: string;
  readonly users: number;
  readonly products: number;
  readonly percentage: number;
  readonly userid: number;
}

export  interface IGetCompanyDto {
  readonly id: string;
  readonly name: string;
  readonly users: number;
  readonly products: number;
  readonly percentage: number;
  readonly createdat: Date;
  readonly updatedat: Date;
  readonly userid: number;
}

