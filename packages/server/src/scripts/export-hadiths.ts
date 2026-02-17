
import { db } from '../db';
import { hadisEnc } from '../db/schema';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Exporting hadiths to JSON...');
  
  const allHadiths = await db.select().from(hadisEnc);
  
  const outputPath = path.resolve(__dirname, '../db/seeds/data/hadiths.json');
  const dir = path.dirname(outputPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(allHadiths, null, 2));
  
  console.log(`Exported ${allHadiths.length} hadiths to ${outputPath}`);
}

main().catch(console.error);
