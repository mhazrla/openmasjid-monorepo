import { useCallback, useEffect, useRef } from 'react';

export const useBeep = (enabled: boolean = true) => 
{
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => 
    {
        audioRef.current = new Audio('/sounds/beep.mp3'); 
    }, []);

    const playBeep = useCallback(() => 
    {
        if (!enabled || !audioRef.current) return;

        audioRef.current.currentTime = 0;
        
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) 
        {
            playPromise.catch((error) => 
            {
                console.warn("Autoplay blocked by browser. User needs to interact first.", error);
            });
        }
    }, [enabled]);

    return { playBeep };
};