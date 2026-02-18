import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { sendError, sendSuccess } from '../../common/utils/response.formatter';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const JWT_HASH_KEY  = '$2b$10$bLx/079ppwRfzQ8egAnwfOvtPRZN6arhLZ1k7g5B2GCkhX82bkxIO';
const DUMMY_HASH    = bcrypt.hashSync(JWT_HASH_KEY, 10);

export async function authRoutes(app: FastifyInstance) 
{
  type LoginInput     = z.infer<typeof loginSchema>;

  app.post<{ Body: LoginInput }>('/login', async (request, reply) => 
  {
    const result = loginSchema.safeParse(request.body);
    if (!result.success) 
    {
      return sendError(reply, 'Validation failed', 400, result.error.errors);
    }

    const { username, password } = result.data;

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    const targetHash        = user ? user.passwordHash : DUMMY_HASH;
    const isPasswordValid   = await bcrypt.compare(password, targetHash);

    if (!user || !isPasswordValid) 
    {
        return sendError(reply, 'Invalid credentials', 401);
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

    return sendSuccess(reply, {
      token,
      user: 
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    }, 'Login successful');
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

      return sendSuccess(reply, null, 'Logged out successfully');
    } 
    catch (err) 
    {
      return sendSuccess(reply, null, 'Logged out successfully');
    }
  });
}
