/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, NestMiddleware } from '@nestjs/common';
import { PostgresService } from '@root/src/storage/postgres/postgres.service';
import { NextFunction, Request, Response } from 'express';

const checkDigit = /^[0-9]+$/;



export default class  AddCompanyMiddleware implements NestMiddleware {

  constructor (private readonly postgres: PostgresService) {}

  async use(
    request: Request,
    response: Response,
    next: NextFunction,
) {
  const { name, users, products, userid } = request.body;

  if (!name) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Missing name' });
  }

  try {
  // get company
  const company = await this.postgres.getCompanyByName(name);
  if (company) {
    return response.status(400).json({
      statusCode: 400,
      message: 'Company already exists',
    });
  }

  if (!users) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Missing users property' });
  }

  if (!checkDigit.test(users)) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Invalid users property' });
  }

  if (!products) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Missing users property' });
  }

  if (!checkDigit.test(products)) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Invalid products property' });
  }

  if (!userid) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Missing userid property' });
  }

  if (!checkDigit.test(userid)) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Invalid users' });
  }
     

    return next();
  } catch (error: any) {
    throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
}