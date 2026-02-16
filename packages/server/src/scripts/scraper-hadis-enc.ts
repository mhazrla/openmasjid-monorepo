
import { db } from '../db';
import { hadisEnc } from '../db/schema';
import { sql } from 'drizzle-orm';

const API_URL = 'https://api.myquran.com/v3/hadis/enc/explore';
const DELAY_MIN = 500;
const DELAY_MAX = 1500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const randomDelay = () => Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1) + DELAY_MIN);

async function main() {
    console.log('\x1b[36m%s\x1b[0m', '=== Hadith Enc Scraper Bot Started (All Grades) ===');
    console.log('Target: api.myquran.com/v3/hadis/enc/explore');
    console.log('Filter: None (Fetch All)\n');

    let page = 1;
    let limit = 10;
    let hasNext = true;
    let totalProcessed = 0;
    let totalInserted = 0;
    let stats = {
        Shahih: 0,
        Hasan: 0,
        Dhaif: 0,
        Maudhu: 0,
        Other: 0
    };

    try {
        while (hasNext) {
            process.stdout.write(`\r\x1b[KFetching page ${page}...`);

            const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
            if (!response.ok) {
                console.error(`\nFailed to fetch page ${page}: ${response.statusText}`);
                // Simple retry logic or skip? Let's skip to next page if it's a specific error, but loop breaks usually.
                // If 429, maybe wait longer?
                 if (response.status === 429) {
                    console.log('\nRate limit hit. Waiting 10s...');
                    await delay(10000);
                    continue; // Retry same page
                }
                break;
            }

            const data = await response.json();
            const hadiths = data.data.hadis;
            const paging = data.data.paging;

            if (!hadiths || hadiths.length === 0) {
                console.log('\nNo more data found.');
                break;
            }

            for (const h of hadiths) {
                totalProcessed++;
                
                // Categorize for stats
                const g = h.grade ? h.grade.trim() : 'Unknown';
                if (g.toLowerCase().includes('shahih') || g.toLowerCase().includes('sahih')) stats.Shahih++;
                else if (g.toLowerCase().includes('hasan')) stats.Hasan++;
                else if (g.toLowerCase().includes('dhaif') || g.toLowerCase().includes('daif')) stats.Dhaif++;
                else if (g.toLowerCase().includes('maudhu')) stats.Maudhu++;
                else stats.Other++;

                try {
                    const result = await db.insert(hadisEnc).values({
                        apiId: h.id,
                        teksArab: h.text?.ar,
                        teksIndo: h.text?.id,
                        takhrij: h.takhrij,
                        hikmah: h.hikmah,
                        grade: g
                    }).onConflictDoNothing().returning();

                    if (result.length > 0) {
                        totalInserted++;
                    }
                } catch (err) {
                    console.error(`\nError inserting hadith ${h.id}:`, err);
                }
            }

            // Dashboard Update
            process.stdout.write(`\r\x1b[K\x1b[32m[RUNNING]\x1b[0m Page: ${page} | Processed: ${totalProcessed} | Inserted: ${totalInserted} | Grades: S:${stats.Shahih} H:${stats.Hasan} D:${stats.Dhaif}`);

            if (!paging.has_next) {
                hasNext = false;
            } else {
                page++;
                const waitTime = randomDelay();
                await delay(waitTime);
            }
        }

        console.log('\n\n\x1b[32m=== SCRAPING COMPLETED ===\x1b[0m');
        console.log(`Total Pages: ${page}`);
        console.log(`Total Processed: ${totalProcessed}`);
        console.log(`Total Inserted: ${totalInserted}`);
        console.log('Stats:', stats);

    } catch (error) {
        console.error('\n\x1b[31mFatal Error:\x1b[0m', error);
        process.exit(1);
    }
}

main().catch(console.error);
