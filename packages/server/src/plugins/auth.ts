import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// 1. Type Augmentation
declare module 'fastify' 
{
  interface FastifyInstance 
  {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
}

export default fp(async (fastify: FastifyInstance) => 
{
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => 
  {
    try 
    {
      await request.jwtVerify();
      const payload = request.user; 

      // Check Token Version (Revocation Check)
      const user = await db.query.users.findFirst({
        where: eq(users.id, payload.id),
        columns: 
        {
          tokenVersion: true
        }
      });

      if (!user || user.tokenVersion !== payload.v) 
      {
        throw new Error('Token Revoked');
      }

    } 
    catch (err) 
    {
      reply.status(401).send({ message: 'Unauthorized: Session expired or revoked' });
    }
  });
});
