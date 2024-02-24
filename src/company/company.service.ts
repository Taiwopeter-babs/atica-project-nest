import { Injectable } from '@nestjs/common';
import { PostgresService } from '../storage/postgres/postgres.service';
import { ICreateCompanyDto, IGetCompanyDto } from './company.dto';

/**
 * ### Company Service class
 */
@Injectable()
export class CompanyService {
  constructor(private readonly pgRepo: PostgresService) {}

  async addCompany(data: ICreateCompanyDto): Promise<IGetCompanyDto> {
    try {
      const newCompany = await this.pgRepo.addCompany(data);

      return newCompany;
    } catch (error) {
      throw error;
    }
  }

  async getCompanyByName(name: string): Promise<IGetCompanyDto | null> {
    try {
      const company = this.pgRepo.getCompanyByName(name);

      return company;
    } catch (error) {
      throw error;
    }
  }

  async getCompanies(): Promise<IGetCompanyDto[]> {
    try {
      const companies = this.pgRepo.getCompanies();

      return companies;
    } catch (error) {
      throw error;
    }
  }

  async getUserCompanies(userId: number): Promise<IGetCompanyDto[]> {
    try {
      const companies = await this.pgRepo.getUserCompaniesById(userId);

      return companies;
    } catch (error) {
      throw error;
    }
  }
}
