import {
  Controller,
  Post,
  HttpStatus,
  HttpException,
  Body,
  Get,
  Req,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { ICreateCompanyDto } from './company.dto';
import { PostgresService } from '../storage/postgres/postgres.service';
import { Request } from 'express';

/**
 * ### Company controller class
 */
@Controller('/api/v1/companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly postgres: PostgresService,
  ) {}

  @Post()
  async addCompany(@Body() companyDto: ICreateCompanyDto) {
    const { users, products, userid } = companyDto;

    try {
      const user = await this.postgres.getUserById(userid);
      if (!user) {
        throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      }

      const company: ICreateCompanyDto = {
        ...companyDto,
        percentage: CompanyController.getCompanyPercentage(users, products),
      };

      const newCompany = await this.companyService.addCompany(company);

      return newCompany;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getCompanies(@Req() request: Request) {
    // check for name in query
    const name = request.query.name as string;

    try {
      if (name) {
        const company = await this.companyService.getCompanyByName(name);
        return (
          company ??
          new HttpException('Company does not exist', HttpStatus.NOT_FOUND)
        );
      }
      return await this.companyService.getCompanies();
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ### returns the percentage of products to users for a company
   */
  private static getCompanyPercentage(users: number, products: number): number {
    if (users <= 0 || products <= 0) {
      return 0;
    }

    const percentage = Math.round((users / products) * 100);

    return percentage > 100 ? 100 : percentage;
  }
}
