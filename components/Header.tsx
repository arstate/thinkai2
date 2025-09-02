

import React, { useState, useEffect, useRef } from 'react';
import { Emotion, CreatorToolsMode } from '../types';
import CreatorToolsHeader from './CreatorToolsHeader';

interface HeaderProps {
    onBack?: () => void;
    emotion?: Emotion;
    aiName: string;
    subtitle?: string;
    aiProfilePicUrl: string;
    onAvatarClick: () => void;
    onDeleteContactClick?: () => void;
    isSearchOpen: boolean;
    onSearchToggle: () => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    searchResultCount: number;
    currentSearchResultIndex: number;
    onGoToNextResult: () => void;
    onGoToPrevResult: () => void;
    onSettingsClick?: () => void;
    creatorToolMode?: CreatorToolsMode;
    onCreatorToolModeChange?: (mode: CreatorToolsMode) => void;
}

const emotionText: Record<string, { text: string; color: string }> = {
    [Emotion.NETRAL]: { text: 'Biasa aja', color: 'bg-gray-400' },
    [Emotion.SENANG]: { text: 'Lagi seneng', color: 'bg-yellow-400' },
    [Emotion.SEDIH]: { text: 'Lagi sedih', color: 'bg-blue-400' },
    [Emotion.MARAH]: { text: 'Lagi marah', color: 'bg-red-500' },
    [Emotion.BADMOOD]: { text: 'Lagi badmood', color: 'bg-indigo-400' },
    [Emotion.SUKA]: { text: 'Lagi berbunga-bunga', color: 'bg-pink-400' },
    [Emotion.SANGE]: { text: 'Lagi sange', color: 'bg-fuchsia-500' },
};

const emotionRingColor: Record<string, string> = {
    [Emotion.NETRAL]: 'ring-gray-400',
    [Emotion.SENANG]: 'ring-yellow-400',
    [Emotion.SEDIH]: 'ring-blue-400',
    [Emotion.MARAH]: 'ring-red-500',
    [Emotion.BADMOOD]: 'ring-indigo-400',
    [Emotion.SUKA]: 'ring-pink-400',
    [Emotion.SANGE]: 'ring-fuchsia-500',
};

const SettingsIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
    </svg>
);


const DeleteIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75V4.5h8V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 10.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75ZM8.5 11.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5ZM12.25 11.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
      <path d="M18 6a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h16Z" />
    </svg>
);

const BackIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
);

const SearchIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
);

const ChevronUpIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M14.77 12.78a.75.75 0 0 1-1.06 0L10 9.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
    </svg>
);

const ChevronDownIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.23 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.23 8.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

const CloseIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ onBack, emotion, aiName, subtitle, aiProfilePicUrl, onAvatarClick, onDeleteContactClick, isSearchOpen, onSearchToggle, searchQuery, onSearchQueryChange, searchResultCount, currentSearchResultIndex, onGoToNextResult, onGoToPrevResult, onSettingsClick, creatorToolMode, onCreatorToolModeChange }) => {
    const currentEmotion = emotion ? emotionText[emotion] : null;
    const ringColorClass = emotion ? emotionRingColor[emotion] : 'ring-gray-400';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Click outside handler to close the menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDelete = () => {
        setIsMenuOpen(false);
        onDeleteContactClick?.();
    };

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-20">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {onBack && (
                         <button
                            onClick={onBack}
                            aria-label="Kembali"
                            className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        >
                            <BackIcon className="w-6 h-6"/>
                        </button>
                    )}
                    <button 
                        onClick={onAvatarClick} 
                        className={`rounded-full focus:outline-none transition-all duration-300 ease-in-out ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ${ringColorClass}`}
                    >
                        <img 
                            src={aiProfilePicUrl} 
                            alt={`Foto profil ${aiName}`}
                            className="w-12 h-12 rounded-full object-cover bg-gray-300 shadow-md transition-all duration-300 ease-in-out cursor-pointer hover:scale-105"
                        />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{aiName}</h1>
                        {creatorToolMode ? (
                            <p className="text-xs font-semibold text-purple-500 dark:text-purple-400">Experimental!!</p>
                        ) : subtitle ? (
                             <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                        ) : currentEmotion && (
                            <div className="flex items-center space-x-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${currentEmotion.color} transition-colors duration-300`}></span>
                                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{currentEmotion.text}</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {creatorToolMode && onCreatorToolModeChange ? (
                    <CreatorToolsHeader 
                        currentMode={creatorToolMode}
                        onModeChange={onCreatorToolModeChange}
                    />
                ) : (
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={onSearchToggle}
                            aria-label="Cari pesan"
                            className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        >
                            <SearchIcon className="w-6 h-6"/>
                        </button>
                        
                        {onSettingsClick && (
                            <button 
                                id="settings-button"
                                onClick={onSettingsClick} 
                                aria-label="Pengaturan"
                                className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-100"
                            >
                                <SettingsIcon className="w-6 h-6"/>
                            </button>
                        )}
                        
                        {onDeleteContactClick && (
                            <div className="relative" ref={menuRef}>
                                <button 
                                    onClick={() => setIsMenuOpen(prev => !prev)} 
                                    aria-label="Opsi Kontak"
                                    aria-haspopup="true"
                                    aria-expanded={isMenuOpen}
                                    className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <div className={`absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 origin-top-right z-30 transition-all duration-150 ease-out ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                    <ul className="py-1">
                                        <li>
                                            <button
                                                onClick={handleDelete}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 font-semibold transition-colors flex items-center gap-3"
                                                role="menuitem"
                                            >
                                                <DeleteIcon className="w-5 h-5" />
                                                <span>Hapus Kontak</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isSearchOpen && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-600 flex items-center gap-2 animate-fade-in-down">
                    <input
                        type="text"
                        placeholder="Cari teks di chat..."
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onGoToNextResult();
                            }
                        }}
                        className="flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                    {searchQuery.trim() && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 w-16 text-center">
                            {searchResultCount > 0 ? `${currentSearchResultIndex + 1}/${searchResultCount}` : '0/0'}
                        </span>
                    )}
                    <button disabled={searchResultCount === 0} onClick={onGoToPrevResult} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <ChevronUpIcon className="w-5 h-5"/>
                    </button>
                    <button disabled={searchResultCount === 0} onClick={onGoToNextResult} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <ChevronDownIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={onSearchToggle} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <CloseIcon className="w-5 h-5"/>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Header;