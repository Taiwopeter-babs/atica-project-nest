/* eslint-disable prettier/prettier */
import { NextFunction, Request, Response } from 'express';



export function validateAddUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { email, password, fullname } = request.body;

  if (!email) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Missing email' });
  }

  if (!password) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Missing password' });
  }

  if (password.length < 8) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Password too short' });
  }

  if (!fullname) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Missing fullname' });
  }

  return next();
}


export async function validateUserLogin(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const { email, password } = request.body;

  if (!email) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Missing email' });
  }

  if (!password) {
    return response
      .status(400)
      .json({ statusCode: 400, message: 'Missing password' });
  }

  return next();
}

