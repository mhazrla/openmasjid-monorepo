import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import util from 'util';

const pump = util.promisify(pipeline);

export async function uploadRoutes(app: FastifyInstance) 
{
    const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

    if (!fs.existsSync(UPLOAD_DIR)) 
    {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    app.post('/upload', async (req, reply) => 
    {
        const data = await req.file();

        if (!data) 
        {
            return reply.status(400).send({ message: 'No file uploaded' });
        }

        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

        if (!ALLOWED_TYPES.includes(data.mimetype)) 
        {
            return reply.status(400).send({ message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' });
        }

        const ext       = path.extname(data.filename);
        const fileName  = `${randomUUID()}${ext}`;
        const filePath  = path.join(UPLOAD_DIR, fileName);

        await pump(data.file, fs.createWriteStream(filePath));
        const fileUrl   = `/public/uploads/${fileName}`;

        return { url: fileUrl };
    });
}
