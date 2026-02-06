import '@fastify/jwt'

declare module '@fastify/jwt' 
{
  interface FastifyJWT 
  {
    payload: 
    {
      id: number;
      username: string;
      role: string;
      v: number; 
    }
    user: 
    {
      id: number;
      username: string;
      role: string;
      v: number;
    }
  }
}
