import request from 'supertest';
import { app } from './setup';
import { createDummyFile } from './helper';

describe('Upload Module', () => {
  it('POST /api/upload should upload a file and return URL', async () => {
    const dummy = createDummyFile('test-poster.jpg');

    const response = await request(app.server)
      .post('/api/upload')
      .attach('file', dummy.content, {
        filename: dummy.filename,
        contentType: dummy.contentType,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('url');
    expect(response.body.data.url).toContain('/public/uploads/');
  });

  it('should fail with invalid file type', async () => {
    const response = await request(app.server)
      .post('/api/upload')
      .attach('file', Buffer.from('not-an-image'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
