import request from 'supertest';
import { app } from './setup';
import { truncateAllTables } from './helper';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import bcrypt from 'bcryptjs';

describe('Auth Module', () => {
  beforeEach(async () => {
    await truncateAllTables();
    
    // Create a test user
    const passwordHash = await bcrypt.hash('testpassword', 10);
    await db.insert(users).values({
      username: 'admin',
      passwordHash: passwordHash,
      role: 'superadmin',
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app.server)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'testpassword',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.username).toBe('admin');
    });

    it('should fail with incorrect credentials', async () => {
      const response = await request(app.server)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully (increment token version)', async () => {
      const loginResponse = await request(app.server)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'testpassword',
        });

      const token = loginResponse.body.data.token;

      const response = await request(app.server)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
