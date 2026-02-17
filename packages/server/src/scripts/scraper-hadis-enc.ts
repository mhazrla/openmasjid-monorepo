
import fs from 'fs';
import path from 'path';

const API_URL = 'https://api.myquran.com/v3/hadis/enc/explore';
const TARGET_FILE = path.resolve(__dirname, '../db/seeds/data/hadiths.json');
const TARGET_COUNT = 500;
const DELAY_MIN = 7000;
const DELAY_MAX = 10000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1) + DELAY_MIN);

let accumulatedHadiths: any[] = [];

// Handle interruption
process.on('SIGINT', () => 
{
    console.log('\n\nCaught interrupt signal.');
    saveData();
    process.exit(0);
});

function saveData() 
{
    if (accumulatedHadiths.length === 0) 
    {
        console.log('No data to save.');
        return;
    }
    console.log(`Writing ${accumulatedHadiths.length} hadiths to file...`);
    const dir = path.dirname(TARGET_FILE);
    if (!fs.existsSync(dir)) 
    {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TARGET_FILE, JSON.stringify(accumulatedHadiths, null, 2));
    console.log(`✅ Saved to ${TARGET_FILE}`);
}

async function main() 
{
    console.log('\x1b[36m%s\x1b[0m', '=== Hadith Enc Scraper & Exporter Started ===');
    console.log(`Target: Fetch ${TARGET_COUNT} hadiths -> ${TARGET_FILE}\n`);

    let page = 1;
    let limit = 10; 
    let hasNext = true;
    
    try 
    {
        while (hasNext && accumulatedHadiths.length < TARGET_COUNT) 
        {
            process.stdout.write(`\r\x1b[KFetching page ${page} (Got ${accumulatedHadiths.length}/${TARGET_COUNT})...`);

            const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
            if (!response.ok) 
            {
                console.error(`\nFailed to fetch page ${page}: ${response.status} ${response.statusText}`);
                const text = await response.text();
                console.error('Response body:', text);
                if (response.status === 429) 
                {
                    console.log('\nRate limit hit. Waiting 10s...');
                    await delay(10000);
                    continue; 
                }
                break;
            }

            const data = await response.json();
            const hadiths = data.data.hadis;
            const paging = data.data.paging;

            if (!hadiths || hadiths.length === 0) 
            {
                console.log('\nNo more data found.');
                break;
            }

            for (const h of hadiths) 
            {
                if (accumulatedHadiths.length >= TARGET_COUNT) break;

                accumulatedHadiths.push({
                    apiId: h.id,
                    teksArab: h.text?.ar,
                    teksIndo: h.text?.id,
                    takhrij: h.takhrij,
                    hikmah: h.hikmah,
                    grade: h.grade ? h.grade.trim() : 'Unknown'
                });
            }

            if (!paging.has_next) 
            {
                hasNext = false;
            } 
            else 
            {
                page++;
                await delay(randomDelay());
            }
        }

        console.log('\n\nScraping finished normally.');
        saveData();

    } 
    catch (error) 
    {
        console.error('\n\x1b[31mFatal Error:\x1b[0m', error);
        process.exit(1);
    }
}

main().catch(console.error);
