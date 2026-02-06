import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function authRoutes(app: FastifyInstance) 
{
  const JWT_HASH_KEY  = '$2b$10$bLx/079ppwRfzQ8egAnwfOvtPRZN6arhLZ1k7g5B2GCkhX82bkxIO';
  const DUMMY_HASH    = await bcrypt.hash(JWT_HASH_KEY, 10);
  type LoginInput     = z.infer<typeof loginSchema>;

  app.post<{ Body: LoginInput }>('/login', async (request, reply) => 
  {
    const result = loginSchema.safeParse(request.body);
    if (!result.success) 
    {
      return reply.status(400).send({ 
        message: 'Validation failed', 
        errors: result.error.errors 
      });
    }

    const { username, password } = result.data;

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    const targetHash        = user ? user.passwordHash : DUMMY_HASH;
    const isPasswordValid   = await bcrypt.compare(password, targetHash);

    if (!user || !isPasswordValid) 
    {
        return reply.status(401).send({ message: 'Invalid credentials' });
    }

    const token = app.jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        v: user.tokenVersion,
      },
      { expiresIn: '1h' }
    );

    return {
      token,
      user: 
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  });

  app.post('/logout', async (request, reply) => 
  {
    try 
    {
      await request.jwtVerify();
      const payload = request.user;

      // ATOMIC UPDATE: Increment version directly in DB
      await db.update(users)
        .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
        .where(eq(users.id, payload.id));

      return { message: 'Logged out successfully' };
    } 
    catch (err) 
    {
      return { message: 'Logged out successfully' };
    }
  });
}
