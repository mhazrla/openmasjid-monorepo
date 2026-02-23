import request from 'supertest';
import { app } from './setup';
import { truncateAllTables, getAuthToken } from './helper';
import { db } from '../src/db';
import { displayConfig, users } from '../src/db/schema';
import bcrypt from 'bcryptjs';

describe('Display Config Module', () => {
  let token: string;

  beforeEach(async () => {
    await truncateAllTables();
    
    await db.insert(users).values({
      username: 'admin',
      passwordHash: await bcrypt.hash('testpassword', 10),
      role: 'superadmin',
    });

    token = await getAuthToken(app);

    await db.insert(displayConfig).values({
      cityId: '9766527f2b5d3e95d4a733fcfb77bd7e',
      runningText: 'Luruskan dan rapatkan shaf...',
    });
  });

  it('GET /api/display-config should return config', async () => {
    const response = await request(app.server).get('/api/display-config');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.cityId).toBe('9766527f2b5d3e95d4a733fcfb77bd7e');
  });

  it('PATCH /api/display-config should update config', async () => {
    const response = await request(app.server)
      .patch('/api/display-config')
      .set('Authorization', `Bearer ${token}`)
      .send({ cityId: '9766527f2b5d3e95d4a733fcfb77bd7e', runningText: 'New text', adzanDuration: 5 });

    expect(response.status).toBe(200);
    expect(response.body.data.runningText).toBe('New text');
  });
});
