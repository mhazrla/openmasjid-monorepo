import { constants } from 'fs';
import fs from 'fs/promises';

export async function fileExists(path: string): Promise<boolean> 
{
  try 
  {
    await fs.access(path, constants.F_OK);
    return true;
  } 
  catch 
  {
    return false;
  }
}