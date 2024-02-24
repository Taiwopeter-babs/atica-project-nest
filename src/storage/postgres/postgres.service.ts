import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex from 'knex';

import { ICreateUserDto, IGetUserDto } from '@src/users/user.dto';
import { ICreateAdminDto, IGetAdminDto } from '@root/src/admin/admin.dto';
import { ICreateCompanyDto, IGetCompanyDto } from '@src/company/company.dto';

/**
 * ### Postgres Service class
 */
@Injectable()
export class PostgresService {
  private readonly Tables = {
    USERS: 'users',
    COMPANIES: 'companies',
    ADMINISTRATORS: 'administrators',
  };

  private readonly fields = [
    'id',
    'fullname',
    'email',
    'firebaseuid',
    'createdat',
    'updatedat',
  ];

  private readonly companyFields = [
    'id',
    'name',
    'users',
    'products',
    'percentage',
    'createdat',
    'updatedat',
  ];

  constructor(private configService: ConfigService) {}

  private getConn() {

    const pgRepo = knex({
      client: 'pg',
      connection:
        this.configService.get<string>('nodeEnv') === 'development'
          ? this.configService.get<string>('postgres.postgresDev')
          : this.configService.get<string>('postgres.postgresProd'),
      searchPath: ['knex', 'public'],
    });

    return pgRepo;
  }

  async addAdmin(
    data: Omit<ICreateAdminDto, 'password'>,
  ): Promise<IGetAdminDto> {
    try {
      const pgRepo = this.getConn();

      // a [{ id }] is returned
      const [res] = await pgRepo(this.Tables.ADMINISTRATORS)
        .returning([...this.fields, 'isadmin'])
        .insert({ ...data });

      const { id, createdat, updatedat, isadmin } = res as any;

      return { id, createdat, updatedat, isadmin, ...data };
    } catch (error) {
      throw error;
    }
  }

  async addUser(data: Omit<ICreateUserDto, 'password'>): Promise<IGetUserDto> {
    try {
      const pgRepo = this.getConn();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      // a [{ id }] is returned
      const [res] = await pgRepo(this.Tables.USERS)
        .returning([...this.fields, 'imageurl'])
        .insert({ ...data });

      const { id, createdat, updatedat, imageurl } = res as any;

      return { id, createdat, updatedat, imageurl, ...data };
    } catch (error) {
      throw error;
    }
  }

  async addCompany(data: ICreateCompanyDto): Promise<IGetCompanyDto> {
    try {
      const pgRepo = this.getConn();

      const [res] = await pgRepo(this.Tables.COMPANIES)
        .returning(['id', 'createdat', 'updatedat'])
        .insert({ ...data });

      const { id, createdat, updatedat } = res as any;

      return { id, createdat, updatedat, ...data };
    } catch (error) {
      throw error;
    }
  }

  async getAdminByEmail(email: string): Promise<IGetAdminDto | null> {
    try {
      const pgRepo = this.getConn();

      const admin = await pgRepo(this.Tables.ADMINISTRATORS)
        .select(...this.fields, 'isadmin')
        .where({ email: email })
        .first();

      if (!admin) {
        return null;
      }

      const adminData = Object.assign({}, admin) as IGetAdminDto;

      return adminData;
    } catch (error) {
      throw error;
    }
  }

  async getAdminById(id: number): Promise<IGetAdminDto | null> {
    try {
      const pgRepo = this.getConn();

      const admin = await pgRepo(this.Tables.ADMINISTRATORS)
        .select(...this.fields, 'isadmin')
        .where({ id: id })
        .first();

      if (!admin) {
        return null;
      }

      const adminData = Object.assign({}, admin) as IGetAdminDto;

      return adminData;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<IGetUserDto | null> {
    try {
      const pgRepo = this.getConn();

      const user = await pgRepo(this.Tables.USERS)
        .select(...this.fields, 'imageurl')
        .where({ email: email })
        .first();

      if (!user) {
        return null;
      }

      const userData = Object.assign({}, user) as IGetUserDto;

      return userData;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: number): Promise<IGetUserDto | null> {
    try {
      const pgRepo = this.getConn();

      const user = await pgRepo(this.Tables.USERS)
        .select(...this.fields, 'imageurl')
        .where({ id: id })
        .first();

      if (!user) {
        return null;
      }

      const userData = Object.assign({}, user) as IGetUserDto;

      return userData;
    } catch (error) {
      throw error;
    }
  }

  async getCompanyByName(name: string): Promise<IGetCompanyDto | null> {
    try {
      const pgRepo = this.getConn();

      // A knex Result {} is returned, extract the rows property
      const result = await pgRepo.raw(
        `SELECT id, name, createdat, updatedat,
         users, products, userid, percentage
         FROM companies WHERE LOWER(name) = ?`,
        [name.toLowerCase()],
      );

      const { rows } = result;

      if (rows.length == 0) {
        return null;
      }

      return Object.assign({}, rows[0]) as IGetCompanyDto;
    } catch (error) {
      throw error;
    }
  }

  async getUserCompaniesById(userId: number): Promise<IGetCompanyDto[]> {
    try {
      const pgRepo = this.getConn();

      const data = await pgRepo(this.Tables.COMPANIES)
        .select(...this.companyFields)
        .where({ userid: userId })
        .orderByRaw('createdat DESC')
        .limit(5); // most recent

      const companies = data.map(
        (company) => Object.assign({}, company) as IGetCompanyDto,
      );

      return companies;
    } catch (error) {
      throw error;
    }
  }

  async getCompanies(): Promise<IGetCompanyDto[]> {
    try {
      const pgRepo = this.getConn();

      const data = await pgRepo(this.Tables.COMPANIES)
        .select(...this.companyFields)
        .orderByRaw('name DESC')
        .limit(20); // most recent

      const companies = data.map(
        (company) => Object.assign({}, company) as IGetCompanyDto,
      );

      return companies;
    } catch (error) {
      throw error;
    }
  }

  async updateUserImage(userId: number, imageUrl: string): Promise<boolean> {
    try {
      const pgRepo = this.getConn();

      await pgRepo(this.Tables.USERS)
        .where({ id: userId })
        .update({ imageurl: imageUrl });

      return true;
    } catch (error) {
      throw error;
    }
  }
}
