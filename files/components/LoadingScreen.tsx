
import React from 'react';

interface LoadingScreenProps {
    title: string;
    subtitle: string;
}

const orbs = [
    { size: 'w-[15vmax] h-[15vmax]', color: 'bg-purple-500', top: '10%', left: '10%', duration: '20s', delay: '0s' },
    { size: 'w-[20vmax] h-[20vmax]', color: 'bg-yellow-500', top: '60%', left: '5%', duration: '25s', delay: '-5s' },
    { size: 'w-[10vmax] h-[10vmax]', color: 'bg-pink-500', top: '20%', left: '70%', duration: '18s', delay: '-10s' },
    { size: 'w-[25vmax] h-[25vmax]', color: 'bg-blue-500', top: '50%', left: '50%', duration: '30s', delay: '-15s' },
    { size: 'w-[8vmax] h-[8vmax]', color: 'bg-green-500', top: '80%', left: '85%', duration: '16s', delay: '-2s' },
    { size: 'w-[12vmax] h-[12vmax]', color: 'bg-red-500', top: '5%', left: '40%', duration: '22s', delay: '-8s' },
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ title, subtitle }) => {
    return (
        <div className="relative flex flex-col items-center justify-center h-full text-center p-8 bg-gray-900 overflow-hidden">
            
            <div className="absolute inset-0 z-0">
                {orbs.map((orb, index) => (
                    <div
                        key={index}
                        className={`absolute ${orb.size} ${orb.color} rounded-full mix-blend-hard-light filter blur-3xl`}
                        style={{
                            top: orb.top,
                            left: orb.left,
                            animation: `float ${orb.duration} ${orb.delay} infinite ease-in-out ${index % 2 === 0 ? 'alternate' : 'alternate-reverse'}`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center">
                <div 
                    className="w-20 h-20 border-t-4 border-b-4 border-white rounded-full mb-8"
                    style={{ animation: 'slow-spin 2.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite' }}
                ></div>
                
                <h1 
                    className="text-3xl font-bold text-white mb-2"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                >
                    {title}
                </h1>
                <p 
                    className="text-lg text-white/90"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                >
                    {subtitle}
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;