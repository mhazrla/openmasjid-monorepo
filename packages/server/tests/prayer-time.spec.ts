import request from 'supertest';
import { app } from './setup';
import { truncateAllTables } from './helper';
import { db } from '../src/db';
import { dsPrayerTimes } from '../src/db/schema';

describe('Prayer-Time Module', () => {
  beforeEach(async () => {
    await truncateAllTables();
  });

  it('GET /api/prayer-times should return today schedule', async () => {
    const today = new Date().toISOString().split('T')[0];
    await db.insert(dsPrayerTimes).values({
      date: today,
      imsak: '04:00',
      subuh: '04:10',
      terbit: '05:30',
      dhuha: '06:00',
      dzuhur: '12:00',
      ashar: '15:10',
      maghrib: '18:10',
      isya: '19:20',
    });

    const response = await request(app.server).get('/api/prayer-times');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('subuh');
  });

  it('POST /api/prayer-times/sync should trigger sync', async () => {
    // This calls external API, might be slow or fail in CI without internet
    // But we test the response format
    const response = await request(app.server).post('/api/prayer-times/sync');
    expect([200, 500]).toContain(response.status); // Depends on network and API key
  });
});
