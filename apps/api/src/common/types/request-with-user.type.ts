import { Request } from 'express';

export interface UserPayload {
  sub: number;      
  email: string;
  uuid: string;
  claims: string[]; 
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}