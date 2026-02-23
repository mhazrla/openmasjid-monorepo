import request from 'supertest';
import { app } from './setup';
import { truncateAllTables, getAuthToken } from './helper';
import { db } from '../src/db';
import { ramadanConfigs, users } from '../src/db/schema';
import bcrypt from 'bcryptjs';

describe('Ramadan Module', () => {
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

  it('should perform CRUD operations on ramadan config', async () => {
    // 1. Init (Create)
    const createRes = await request(app.server)
      .post('/api/ramadan/init')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hijriYear: 1445,
        gregorianYear: 2024,
        title: 'Ramadan Test',
        subtitle: 'Test Subtitle',
        startDate: '2024-03-11',
      });

    expect(createRes.status).toBe(201);
    const id = createRes.body.data.id;

    // 2. Get Active
    const getActiveRes = await request(app.server).get('/api/ramadan');
    expect(getActiveRes.status).toBe(200);
    expect(getActiveRes.body.data.title).toBe('Ramadan Test');

    // 3. Update
    const updateRes = await request(app.server)
      .patch(`/api/ramadan/config/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Ramadan Updated', cityId: '9766527f2b5d3e95d4a733fcfb77bd7e' }); // Add cityId if required or just title

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe('Ramadan Updated');
  });
});
