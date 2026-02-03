import { FastifyInstance } from 'fastify';
import { mosqueRoutes } from './modules/mosque/mosque.routes';
import { prayerTimeRoutes } from './modules/prayer-time/prayer-time.routes';
import { displayConfigRoutes } from './modules/display-config/display-config.routes';
import { shortlinkApiRoutes, shortlinkRedirectRoutes } from './modules/shortlink/shortlink.routes';

export async function appRoutes(app: FastifyInstance) {
  // 1. Health Check & Root
  app.get('/', async () => 
  {
    return { status: 'ok', message: 'OpenMasjid API is running' };
  });

  // 2. Public Routes (Redirects)
  // Route: /s/:slug
  app.register(shortlinkRedirectRoutes, { prefix: '/s' });

  // 3. API Routes (Encapsulated under /api)
  app.register(async (api) => 
  {
    api.register(mosqueRoutes, { prefix: '/mosque-profile' });
    api.register(prayerTimeRoutes, { prefix: '/prayer-times' });
    api.register(displayConfigRoutes, { prefix: '/display-config' });
    api.register(shortlinkApiRoutes, { prefix: '/shortlinks' });
  }, { prefix: '/api' });
}
