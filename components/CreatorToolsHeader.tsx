
import React, { useState, useRef, useEffect } from 'react';
import { CreatorToolsMode } from '../types';

interface CreatorToolsHeaderProps {
    currentMode: CreatorToolsMode;
    onModeChange: (mode: CreatorToolsMode) => void;
}

const modes = [
    { id: CreatorToolsMode.SCRIPT, label: 'Script Maker' },
    { id: CreatorToolsMode.STORYBOARD, label: 'Storyboard Maker' },
    { id: CreatorToolsMode.SHOTLIST, label: 'Shotlist Maker' },
];

const ChevronDownIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.23 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.23 8.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);


const CreatorToolsHeader: React.FC<CreatorToolsHeaderProps> = ({ currentMode, onModeChange }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (mode: CreatorToolsMode) => {
        onModeChange(mode);
        setIsDropdownOpen(false);
    };

    const currentLabel = modes.find(m => m.id === currentMode)?.label;

    return (
        <>
            {/* Desktop: Buttons */}
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                {modes.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${
                            currentMode === mode.id
                                ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>
            {/* Mobile: Dropdown */}
            <div className="relative md:hidden" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(p => !p)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    <span>{currentLabel}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 origin-top-right z-30 animate-fade-in-down">
                        <ul className="py-1" role="menu">
                            {modes.map(mode => (
                                <li key={mode.id}>
                                    <button
                                        onClick={() => handleSelect(mode.id)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/40"
                                        role="menuitem"
                                    >
                                        {mode.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};

export default CreatorToolsHeader;
