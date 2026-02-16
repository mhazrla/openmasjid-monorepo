
import { db } from '../db';
import { HadisRepository } from '../modules/hadis/hadis.repository';
import { HadisService } from '../modules/hadis/hadis.service';

async function testHadisDisplay() {
    const repo = new HadisRepository();
    const service = new HadisService(repo);

    console.log('Fetching display hadith...');
    const result = await service.getDisplayHadith();
    
    if (result) {
        console.log('SUCCESS: Retrieved Hadith');
        console.log('ID:', result.id);
        console.log('Source:', result.takhrij);
        console.log('Grade:', result.grade);
        console.log('Text Start:', result.teksIndo?.substring(0, 50) + '...');
    } else {
        console.log('FAILED: No Hadith returned (maybe DB empty?)');
    }
}

testHadisDisplay().catch(console.error);
