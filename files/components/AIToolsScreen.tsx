



import React from 'react';

interface AIToolsScreenProps {
    onSelectTool: (toolId: string) => void;
}

const ImageToolIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.5a.75.75 0 0 0 .5.707c1.728.423 3.284.774 4.887.953a.75.75 0 0 0 .763-.678V12.93a.75.75 0 0 1 .53-1.06l5.22-3.131a.75.75 0 0 0 0-1.318l-5.22-3.131a.75.75 0 0 1-.53-1.06V4.533Z" />
      <path d="M19.5 3.75a.75.75 0 0 0-1.5 0v16.5a.75.75 0 0 0 1.5 0V3.75Z" />
    </svg>
);

const EraserIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
    <path d="M5.21 14.21a.75.75 0 0 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06Z" />
    <path d="M3.09 18.33a.75.75 0 0 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06Z" />
  </svg>
);

const CreatorToolIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12.75 3.75a.75.75 0 0 0-1.5 0v1.5h-1.5a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0v-1.5h1.5a.75.75 0 0 0 0-1.5h-1.5v-1.5Z" />
        <path fillRule="evenodd" d="M11.025 13.435a.75.75 0 0 1 .166.511v3.229a.75.75 0 0 1-1.342.374l-2.07-4.14a.75.75 0 0 1 .14-.88l4.417-3.926a.75.75 0 0 1 1.056.09l4.667 5.163a.75.75 0 0 1-.02 1.06l-3.084 2.89a.75.75 0 0 1-1.028-.112l-2.008-2.343a.75.75 0 0 1 .006-1.042l1.018-.932-.387-.216-1.018.933Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M3 10.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3.75a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5h-2.25a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
);

const VideoIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-15Zm-1.5 3a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5-1.5h-15a1.5 1.5 0 0 1-1.5-1.5v-9Z" />
        <path d="M8.25 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.5 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM15.75 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" />
    </svg>
);


const AIToolsScreen: React.FC<AIToolsScreenProps> = ({ onSelectTool }) => {
    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 relative">
            <main className="flex-1 overflow-y-auto p-2">
                <ul className="space-y-1">
                     <li onClick={() => onSelectTool('ai-image-creator')} className="flex items-center p-4 space-x-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg">
                        <div className="w-14 h-14 rounded-full object-cover bg-indigo-500 shadow-sm flex items-center justify-center">
                            <ImageToolIcon className="w-8 h-8 text-white"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-gray-800 dark:text-white truncate">Image Gen</p>
                            <p className="text-sm truncate text-gray-500 dark:text-gray-400">
                                Buat gambar dari imajinasimu
                            </p>
                        </div>
                    </li>
                     <li onClick={() => onSelectTool('ai-video-gen')} className="flex items-center p-4 space-x-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg">
                        <div className="w-14 h-14 rounded-full object-cover bg-cyan-500 shadow-sm flex items-center justify-center">
                            <VideoIcon className="w-7 h-7 text-white"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-gray-800 dark:text-white truncate">Video Gen</p>
                            <p className="text-sm truncate text-gray-500 dark:text-gray-400">
                                Buat video dari teks atau gambar (Veo 2)
                            </p>
                        </div>
                    </li>
                    <li onClick={() => onSelectTool('ai-remove-background')} className="flex items-center p-4 space-x-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg">
                        <div className="w-14 h-14 rounded-full object-cover bg-teal-500 shadow-sm flex items-center justify-center">
                            <EraserIcon className="w-7 h-7 text-white"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-gray-800 dark:text-white truncate">Background Removal</p>
                            <p className="text-sm truncate text-gray-500 dark:text-gray-400">
                                Hapus latar belakang gambar
                            </p>
                        </div>
                    </li>
                     <li onClick={() => onSelectTool('ai-creator-tools')} className="flex items-center p-4 space-x-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg">
                        <div className="w-14 h-14 rounded-full object-cover bg-amber-500 shadow-sm flex items-center justify-center">
                            <CreatorToolIcon className="w-7 h-7 text-white"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-gray-800 dark:text-white truncate">Creator Tools</p>
                            <p className="text-sm truncate text-gray-500 dark:text-gray-400">
                                Buat Script, Storyboard, dan Shot List
                            </p>
                        </div>
                    </li>
                </ul>
            </main>
        </div>
    );
};

export default AIToolsScreen;