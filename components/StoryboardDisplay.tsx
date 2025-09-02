
import React from 'react';
import { StoryboardPanel } from '../types';

interface StoryboardDisplayProps {
    panels: StoryboardPanel[];
    onGenerateImage: (panelIndex: number) => void;
    onImageClick: (imageUrl: string) => void;
}

const GenerateIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10 3.75a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5a.75.75 0 0 1 .75-.75Z" />
        <path fillRule="evenodd" d="M5.455 13.045A.75.75 0 0 1 6.22 13h7.56a.75.75 0 0 1 .765.955l-1.42 2.84a.75.75 0 0 1-1.33 0l-1.42-2.84a.75.75 0 0 0-1.33 0l-1.42 2.84a.75.75 0 0 1-1.33 0L5.455 13.045ZM13.22 15h-6.44l.71-1.42a2.25 2.25 0 0 1 4.32 0l.71 1.42Z" clipRule="evenodd" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const StoryboardDisplay: React.FC<StoryboardDisplayProps> = ({ panels, onGenerateImage, onImageClick }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
            {panels.map((panel, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex flex-col gap-2 border border-gray-200 dark:border-gray-700">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-md relative group overflow-hidden">
                        {panel.imageUrl ? (
                             <img 
                                src={panel.imageUrl} 
                                alt={`Storyboard panel ${panel.scene}`} 
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => onImageClick(panel.imageUrl!)}
                            />
                        ) : (
                             <div className="w-full h-full flex items-center justify-center">
                                <span className="text-5xl font-bold text-gray-300 dark:text-gray-600 select-none">
                                    {panel.scene}
                                </span>
                             </div>
                        )}
                       
                        {panel.isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <button 
                                onClick={() => onGenerateImage(index)}
                                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-md transition-opacity duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm hover:bg-blue-600"
                            >
                                <GenerateIcon className="w-4 h-4" />
                                Generate
                            </button>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                           ACTION
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{panel.actionNotes}</p>
                    </div>
                     <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                           CAMERA
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{panel.cameraNotes}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StoryboardDisplay;
