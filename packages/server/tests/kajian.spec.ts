import request from 'supertest';
import { app } from './setup';
import { truncateAllTables, getAuthToken } from './helper';
import { db } from '../src/db';
import { people } from '../src/db/schema';

describe('Kajian Module', () => {
  let token: string;
  let speakerId: number;

  beforeEach(async () => {
    await truncateAllTables();
    
    // Setup: User and Speaker
    const [speaker] = await db.insert(people).values({
      name: 'Ustadz Test',
      type: 'ustadz',
      status: true,
    }).returning();
    speakerId = speaker.id;

    // Create admin user for login
    const bcrypt = await import('bcryptjs');
    const { users } = await import('../src/db/schema');
    await db.insert(users).values({
      username: 'admin',
      passwordHash: await bcrypt.default.hash('testpassword', 10),
      role: 'superadmin',
    });

    token = await getAuthToken(app);
  });

  describe('GET /api/kajian', () => {
    it('should return paginated results with meta', async () => {
      // Seed some data
      await db.insert((await import('../src/db/schema')).kajianEvents).values([
        { title: 'Kajian 1', speakerId, type: 'kajian_rutin' },
        { title: 'Kajian 2', speakerId, type: 'kajian_tematik' },
      ]);

      const response = await request(app.server)
        .get('/api/kajian')
        .query({ page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
      expect(response.body.meta).toEqual({
        page: 1,
        limit: 1
      });
    });

    it('should filter by search query', async () => {
       await db.insert((await import('../src/db/schema')).kajianEvents).values([
        { title: 'Special Topic', speakerId },
        { title: 'Regular Topic', speakerId },
      ]);

      const response = await request(app.server)
        .get('/api/kajian')
        .query({ search: 'Special' });

      expect(response.status).toBe(200);
      expect(response.body.data.some((k: any) => k.title === 'Special Topic')).toBe(true);
      expect(response.body.data.every((k: any) => k.title !== 'Regular Topic')).toBe(true);
    });
  });

  describe('CRUD Operations', () => {
    it('should create, update, and delete a kajian event', async () => {
      // 1. Create
      const createRes = await request(app.server)
        .post('/api/kajian')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'New Kajian')
        .field('speakerId', speakerId.toString())
        .field('type', 'kajian_rutin')
        .field('dayOfWeek', '1')
        .field('time', '18:30')
        .field('status', 'true');

      expect(createRes.status).toBe(201);
      const id = createRes.body.data.id;

      // 2. Update
      const updateRes = await request(app.server)
        .patch(`/api/kajian/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Updated Kajian');

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.title).toBe('Updated Kajian');

      // 3. Delete
      const deleteRes = await request(app.server)
        .delete(`/api/kajian/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });
  });
});
