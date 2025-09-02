import React from 'react';

interface ProgressBarProps {
    count: number;
    currentIndex: number;
    progress: number;
    isPaused: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ count, currentIndex, progress, isPaused }) => {
    return (
        <div className="flex gap-1 w-full">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white rounded-full"
                        style={{
                            width: `${index < currentIndex ? 100 : index === currentIndex ? progress : 0}%`,
                            transition: index === currentIndex && !isPaused ? 'width 0.1s linear' : 'none',
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default ProgressBar;
