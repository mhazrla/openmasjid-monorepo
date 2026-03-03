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
import { hadisRoutes } from './modules/hadis/hadis.routes';
import { financeRoutes } from './modules/finance/finance.routes';
import { archiveRoutes } from './modules/archive/archive.routes';

export async function appRoutes(app: FastifyInstance) 
{
  app.register(shortlinkRedirectRoutes, { prefix: '/s' });

  app.register(async (api) =>  
  {
    api.get('/', async () => 
    {
      return { status: 'ok', message: 'OpenMasjid API is running' };
    });
    api.register(mosqueRoutes, { prefix: '/mosque-profile' });
    api.register(prayerTimeRoutes, { prefix: '/prayer-times' });
    api.register(displayConfigRoutes, { prefix: '/display-config' });
    api.register(shortlinkApiRoutes, { prefix: '/shortlinks' });
    api.register(ramadanRoutes, { prefix: '/ramadan' });
    api.register(peopleRoutes, { prefix: '/people' });
    api.register(kajianRoutes, { prefix: '/kajian' });
    api.register(hadisRoutes, { prefix: '/hadis' });
    api.register(financeRoutes, { prefix: '/finance' });

    // Auth Routes
    api.register(authRoutes, { prefix: '/auth' });
    
    // Archive Module (Feature Toggled)
    if (process.env.ENABLE_ARCHIVE?.trim() === 'true') 
    {
      api.register(archiveRoutes, { prefix: '/archive' });
    }
    
    // Upload Routes
    api.register(uploadRoutes);
  }, { prefix: '/api' });
}
