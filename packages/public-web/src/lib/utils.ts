export function getImageUrl(path: string | null | undefined): string 
{
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) 
    {
        return path;
    }

    return path;
}
