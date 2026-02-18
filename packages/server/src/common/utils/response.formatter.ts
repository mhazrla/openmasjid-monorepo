import { FastifyReply } from 'fastify';

interface ApiResponse<T> 
{
  success: boolean;
  message: string;
  data?: T;
  meta?: 
  {
    page: number;
    limit: number;
    total?: number;
    totalPages?: number;
  };
  errors?: any;
}

export const sendSuccess = <T>(
  reply: FastifyReply, 
  data: T, 
  message: string = 'Success', 
  statusCode: number = 200,
  meta?: ApiResponse<T>['meta']
) => {
  const response: ApiResponse<T> = 
  {
    success: true,
    message,
    data,
    meta
  };
  return reply.code(statusCode).send(response);
};

export const sendError = (
  reply: FastifyReply, 
  message: string = 'Internal Server Error', 
  statusCode: number = 500, 
  errors?: any
) => {
  const response: ApiResponse<null> = 
  {
    success: false,
    message,
    errors
  };
  return reply.code(statusCode).send(response);
};