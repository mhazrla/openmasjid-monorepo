import React, { useState, useEffect, type ReactNode } from 'react';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

interface DisplayWrapperProps {
    children: ReactNode;
}

export const DisplayWrapper: React.FC<DisplayWrapperProps> = ({ children }) => 
{
    const [scale, setScale] = useState<number>(1);

    useEffect(() => {
        const calculateScale = () => 
        {
            const s = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT);
            setScale(s);
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, []);

    return (
        <div 
            className="w-screen h-screen overflow-hidden flex items-start justify-start relative"
            style={{ 
                background: 'radial-gradient(ellipse at top, #0f172a, #020617, #000000)',
                backgroundColor: '#020617' 
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${CANVAS_WIDTH}px`,
                    height: `${CANVAS_HEIGHT}px`,
                    transformOrigin: 'top left',
                    transform: `scale(${scale})`,
                    backgroundColor: 'transparent' 
                }}
            >
                {children}
            </div>
        </div>
    );
};