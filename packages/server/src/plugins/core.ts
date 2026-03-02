import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export default fp(async (app) => 
{
    // CORS: Allow everything for troubleshooting
    await app.register(cors, 
    { 
        origin: true, // Reflects the request origin
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
        // allowedHeaders: ['Content-Type', 'Authorization'],
        // credentials: true
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('FATAL: JWT_SECRET environment variable is not defined.');
        process.exit(1);
    }

    // --- Plugins ---
    await app.register(import('@fastify/compress'), { global: true });

    await app.register(import('@fastify/multipart'), 
    {
        limits: { fileSize: 2 * 1024 * 1024 }
    });

    await app.register(import('@fastify/jwt'), 
    {
        secret: jwtSecret,
        sign: { expiresIn: '1h' } 
    });
});
