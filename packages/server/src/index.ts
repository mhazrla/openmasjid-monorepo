import { buildApp } from './app';
import { config } from './config';

const start = async () => {
    try {
        const app = await buildApp();
        await app.listen({ port: config.PORT, host: config.HOST });
        console.log(`🚀 Server running at http://${config.HOST}:${config.PORT}`);
        console.log(`Routes:
- GET  /api/mosque-profile
- POST /api/mosque-profile`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
