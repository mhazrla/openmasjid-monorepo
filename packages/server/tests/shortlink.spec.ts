import request from 'supertest';
import { app } from './setup';
import { truncateAllTables, getAuthToken } from './helper';
import { db } from '../src/db';
import { shortlinks, users } from '../src/db/schema';
import bcrypt from 'bcryptjs';

describe('Shortlink Module', () => {
  let token: string;

  beforeEach(async () => {
    await truncateAllTables();
    
    await db.insert(users).values({
      username: 'admin',
      passwordHash: await bcrypt.hash('testpassword', 10),
      role: 'superadmin',
    });

    token = await getAuthToken(app);
  });

  describe('GET /api/shortlinks', () => {
    it('should return paginated shortlinks', async () => {
      await db.insert(shortlinks).values([
        { slug: 'link1', originalUrl: 'https://google.com' },
        { slug: 'link2', originalUrl: 'https://bing.com' },
      ]);

      const response = await request(app.server)
        .get('/api/shortlinks')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta).toHaveProperty('page');
    });
  });

  describe('CRUD Operations', () => {
    it('should create and update a shortlink', async () => {
      const createRes = await request(app.server)
        .post('/api/shortlinks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          slug: 'test-slug',
          originalUrl: 'https://example.com',
          description: 'A test link'
        });

      expect(createRes.status).toBe(201);
      const id = createRes.body.data.id;

      const updateRes = await request(app.server)
        .put(`/api/shortlinks/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Updated description' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.description).toBe('Updated description');
    });
  });
});
