import request from 'supertest';
import { app } from './setup';
import { truncateAllTables, getAuthToken } from './helper';
import { db } from '../src/db';
import { dsMosqueProfile, users } from '../src/db/schema';
import bcrypt from 'bcryptjs';

describe('Mosque Module', () => {
  let token: string;

  beforeEach(async () => {
    await truncateAllTables();
    
    await db.insert(users).values({
      username: 'admin',
      passwordHash: await bcrypt.hash('testpassword', 10),
      role: 'superadmin',
    });

    token = await getAuthToken(app);

    // Seed initial profile
    await db.insert(dsMosqueProfile).values({
      id: 1,
      name: 'Test Mosque',
      address: 'Test Address',
    });
  });

  it('GET /api/mosque-profile should return profile', async () => {
    const response = await request(app.server).get('/api/mosque-profile');
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Test Mosque');
  });

  it('PATCH /api/mosque-profile should update profile', async () => {
    const response = await request(app.server)
      .patch('/api/mosque-profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated name', address: 'Updated address' });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Updated name');
  });
});
