import React, { useState, useEffect, useCallback } from 'react';
import { StoryItem, User, AIContact } from '../../types';
import ProgressBar from './ProgressBar';

interface StoryViewerProps {
    storyGroup: {
        stories: StoryItem[];
        author: User | AIContact;
    };
    onClose: () => void;
    onDeleteStory: (storyId: string) => void;
}

const STORY_DURATION = 5000; // 5 seconds

const CloseIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

const UserPlaceholderIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
    </svg>
);

const DeleteIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9ZM12 3.25a.75.75 0 0 1 .75.75v.008l.008-.008a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008l.008-.008a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008l.008-.008a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008l.008-.008a.75.75 0 0 1 .75-.75H12Z" clipRule="evenodd" />
    </svg>
);


const StoryViewer: React.FC<StoryViewerProps> = ({ storyGroup, onClose, onDeleteStory }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    
    const { stories, author } = storyGroup;
    const currentStory = stories[currentIndex];

    // Safe navigation effect for when stories array changes (e.g., deletion)
    useEffect(() => {
        if (stories.length === 0) {
            onClose();
        } else if (currentIndex >= stories.length) {
            setCurrentIndex(stories.length - 1);
        }
    }, [stories.length, currentIndex, onClose]);

    const nextStory = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(c => c + 1);
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, onClose]);

    const prevStory = () => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : 0));
    };

    useEffect(() => {
        if (isPaused || !currentStory) return;

        setProgress(0); // Reset progress for new story
        const timer = setTimeout(nextStory, STORY_DURATION);
        
        const interval = setInterval(() => {
            setProgress(p => p + 100 / (STORY_DURATION / 100));
        }, 100);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [currentIndex, nextStory, isPaused, currentStory]);

    const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, currentTarget } = e;
        const { left, width } = currentTarget.getBoundingClientRect();
        const tapPosition = (clientX - left) / width;
        if (tapPosition > 0.3) {
            nextStory();
        } else {
            prevStory();
        }
    };

    const handleMouseDown = () => setIsPaused(true);
    const handleMouseUp = () => setIsPaused(false);
    
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent tap navigation
        if (currentStory) {
            onDeleteStory(currentStory.id);
        }
    }

    const isUserAuthor = 'stories' in author;
    const authorName = isUserAuthor ? (author as User).name : (author as AIContact).name;
    const authorPic = isUserAuthor ? (author as User).profilePicUrl : (author as AIContact).profilePicUrl;
    
    if (!currentStory) return null;

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center animate-fade-in" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div className="w-full max-w-lg h-full md:h-[95vh] md:max-h-[800px] flex flex-col p-4 relative">
                <header className="absolute top-0 left-0 right-0 p-4 pt-6 z-20">
                    <ProgressBar count={stories.length} currentIndex={currentIndex} progress={progress} isPaused={isPaused} />
                     <div className="flex items-center gap-3 mt-3">
                        <div className="w-10 h-10 rounded-full bg-gray-600">
                             {authorPic ? (
                                <img src={authorPic} alt={authorName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <UserPlaceholderIcon className="text-gray-400 p-1" />
                            )}
                        </div>
                        <div>
                            <p className="text-white font-bold text-shadow">{authorName}</p>
                            <p className="text-gray-300 text-xs text-shadow">
                                {new Date(currentStory.timestamp).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                     </div>
                </header>
                
                <button onClick={onClose} className="absolute top-6 right-4 z-30 p-2 text-white hover:bg-white/20 rounded-full">
                    <CloseIcon className="w-7 h-7" />
                </button>
                
                <main className="flex-1 flex items-center justify-center rounded-lg overflow-hidden relative">
                    {currentStory.type === 'image' ? (
                        <div className="relative w-full h-full">
                            <img src={currentStory.imageUrl} alt="Story content" className="w-full h-full object-contain" />
                            {currentStory.content && (
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-center">
                                    <p className="text-white text-lg text-shadow">{currentStory.content}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                         <div className={`w-full h-full flex items-center justify-center p-8 ${currentStory.backgroundColor}`}>
                            <p className="text-white text-4xl font-bold text-center text-shadow-lg">{currentStory.content}</p>
                        </div>
                    )}
                </main>
                
                {isUserAuthor && (
                    <div className="absolute bottom-4 right-4 z-20">
                        <button
                          onClick={handleDeleteClick}
                          className="p-3 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                          aria-label="Hapus Story"
                        >
                            <DeleteIcon className="w-6 h-6" />
                        </button>
                    </div>
                )}


                <div className="absolute inset-0 z-10" onClick={handleTap}></div>
            </div>
        </div>
    );
};

export default StoryViewer;