import request from 'supertest';
import { app } from './setup';
import { truncateAllTables, getAuthToken } from './helper';
import { db } from '../src/db';
import { people, users } from '../src/db/schema';
import bcrypt from 'bcryptjs';

describe('People Module', () => {
  let token: string;

  beforeEach(async () => {
    await truncateAllTables();
    
    // Create admin for token
    await db.insert(users).values({
      username: 'admin',
      passwordHash: await bcrypt.hash('testpassword', 10),
      role: 'superadmin',
    });

    token = await getAuthToken(app);
  });

  describe('GET /api/people', () => {
    it('should return paginated list of people', async () => {
      await db.insert(people).values([
        { name: 'Person 1', type: 'jamaah' },
        { name: 'Person 2', type: 'ustadz' },
        { name: 'Person 3', type: 'pengurus' },
      ]);

      const response = await request(app.server)
        .get('/api/people')
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.meta).toEqual({ page: 1, limit: 2 });
    });

    it('should filter by type', async () => {
       await db.insert(people).values([
        { name: 'Jamaah A', type: 'jamaah' },
        { name: 'Ustadz B', type: 'ustadz' },
      ]);

      const response = await request(app.server)
        .get('/api/people')
        .query({ type: 'ustadz' });

      expect(response.status).toBe(200);
      expect(response.body.data.every((p: any) => p.type === 'ustadz')).toBe(true);
    });
  });

  describe('CRUD Operations', () => {
    it('should perform full CRUD cycle', async () => {
      // 1. Create
      const createRes = await request(app.server)
        .post('/api/people')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          type: 'jamaah',
          phoneNumber: '08123456789',
          status: true
        });

      expect(createRes.status).toBe(201);
      const id = createRes.body.data.id;

      // 2. Update
      const updateRes = await request(app.server)
        .patch(`/api/people/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'John Updated' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.name).toBe('John Updated');

      // 3. Delete (Deactivate)
      const deleteRes = await request(app.server)
        .delete(`/api/people/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.status).toBe(false);
    });
  });
});
