import { FastifyInstance } from 'fastify';
import { mosqueRoutes } from './modules/mosque/mosque.routes';
import { prayerTimeRoutes } from './modules/prayer-time/prayer-time.routes';
import { displayConfigRoutes } from './modules/display-config/display-config.routes';
import { shortlinkApiRoutes, shortlinkRedirectRoutes } from './modules/shortlink/shortlink.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { uploadRoutes } from './modules/upload/upload.routes';
import { ramadanRoutes } from './modules/ramadan/ramadan.routes';
import { peopleRoutes } from './modules/people/people.routes';
import { kajianRoutes } from './modules/kajian/kajian.routes';

export async function appRoutes(app: FastifyInstance) 
{
  app.get('/', async () => 
  {
    return { status: 'ok', message: 'OpenMasjid API is running' };
  });

  app.register(shortlinkRedirectRoutes, { prefix: '/s' });

  app.register(async (api) => 
  {
    api.register(mosqueRoutes, { prefix: '/mosque-profile' });
    api.register(prayerTimeRoutes, { prefix: '/prayer-times' });
    api.register(displayConfigRoutes, { prefix: '/display-config' });
    api.register(shortlinkApiRoutes, { prefix: '/shortlinks' });
    api.register(ramadanRoutes, { prefix: '/ramadan' });
    api.register(peopleRoutes, { prefix: '/people' });
    api.register(kajianRoutes, { prefix: '/kajian' });

    // Auth Routes
    api.register(authRoutes, { prefix: '/auth' });
    
    // Upload Routes
    api.register(uploadRoutes);
  }, { prefix: '/api' });
}
