import React, { useRef, useEffect, useState } from 'react';
import { AspectRatio, CameraAngle, ShotType, ImageSettings, ImageStyle } from '../../types';

interface ImageSettingsPopoverProps {
    settings: ImageSettings;
    onChange: (newSettings: Partial<ImageSettings>) => void;
    onClose: () => void;
}

// Icons
const ChevronRightIcon: React.FC<{className: string}> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" /> </svg> );
const BackIcon: React.FC<{className: string}> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg> );
const CheckIcon: React.FC<{className: string}> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143Z" clipRule="evenodd" /> </svg> );
const UploadIcon: React.FC<{className: string}> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" /></svg> );
const CloseIcon: React.FC<{className: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /> </svg> );
const InfoIcon: React.FC<{className: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" /></svg>);
const LockClosedIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" /></svg>);

const options = {
    quality: [ { label: 'Imagen 3 (Quality)', value: 'imagen-3' }, { label: 'Imagen 4 (Best Quality)', value: 'imagen-4' } ],
    style: [ { label: 'Default', value: 'default' }, { label: 'Photorealism', value: 'Photorealism' }, { label: 'Anime (Ghibli)', value: 'Anime-Ghibli-Inspired' }, { label: 'Cartoon', value: 'Cartoon' }, { label: 'Digital Painting', value: 'Digital Painting' }, { label: 'Fantasy Art', value: 'Fantasy-Art' }, { label: 'Cyberpunk', value: 'Cyberpunk' }, { label: 'Pixel Art', value: 'Pixel-Art' } ],
    aspectRatio: [ { label: 'Square (1:1)', value: '1:1' }, { label: 'Portrait (3:4)', value: '3:4' }, { label: 'Landscape (4:3)', value: '4:3' }, { label: 'Widescreen (16:9)', value: '16:9' }, { label: 'Tall (9:16)', value: '9:16' } ],
    cameraAngle: [ { label: 'Default', value: 'default' }, { label: 'Eye-Level', value: 'Eye-Level' }, { label: 'Low-Angle', value: 'Low-Angle' }, { label: 'High-Angle', value: 'High-Angle' }, { label: 'Point of View', value: 'POV' } ],
    shotType: [ { label: 'Default', value: 'default' }, { label: 'Wide Shot', value: 'Wide' }, { label: 'Medium Shot', value: 'Medium' }, { label: 'Close-Up', value: 'Close-Up' }, { label: 'Extreme Close-Up', value: 'Extreme Close-Up' }, { label: 'Fish-Eye', value: 'Fish-Eye' } ]
// Fix: Add `as const` to correctly infer literal types for the `value` properties,
// resolving type mismatches with specific string literal types like `AspectRatio`.
} as const;
const consistentAspectRatios: AspectRatio[] = ['3:4', '16:9', '9:16'];

type SubMenu = keyof typeof options;

const MultiReferenceUpload: React.FC<{
    label: string;
    urls: readonly string[] | string[];
    onAdd: (dataUrl: string) => void;
    onRemove: (index: number) => void;
    limit: number;
    isDisabled?: boolean;
}> = ({ label, urls, onAdd, onRemove, limit, isDisabled }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = scrollRef.current;
        if (element) {
            const onWheel = (e: WheelEvent) => {
                if (e.deltaY === 0) return;
                e.preventDefault();
                element.scrollBy({
                    left: e.deltaY < 0 ? -40 : 40,
                    behavior: 'auto'
                });
            };
            element.addEventListener('wheel', onWheel, { passive: false });
            return () => element.removeEventListener('wheel', onWheel);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => { onAdd(event.target?.result as string); };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const canUpload = !isDisabled && urls.length < limit;

    return (
        <div className="w-full flex flex-col items-start gap-1.5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label} ({urls.length}/{limit})</p>
            <div ref={scrollRef} className="w-full bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-lg flex gap-1.5 overflow-x-auto">
                {urls.map((url, index) => (
                    <div key={index} className="relative aspect-square w-24 h-24 flex-shrink-0">
                        <img src={url} alt={`${label} preview ${index}`} className="w-full h-full object-cover rounded-md" />
                         <button onClick={() => onRemove(index)} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full shadow hover:bg-red-600">
                            <CloseIcon className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                {canUpload && (
                     <button
                        onClick={() => inputRef.current?.click()}
                        className="w-24 h-24 flex-shrink-0 aspect-square bg-gray-200 dark:bg-gray-600/50 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-500/50 transition-colors"
                    >
                        <UploadIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
            <input type="file" accept="image/*" ref={inputRef} onChange={handleFileChange} className="hidden" />
        </div>
    );
};


const ImageSettingsPopover: React.FC<ImageSettingsPopoverProps> = ({ settings, onChange, onClose }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [activeSubMenu, setActiveSubMenu] = useState<SubMenu | null>(null);
    const [view, setView] = useState<'main' | 'reference'>('main');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const settingsButton = document.getElementById('settings-button');
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && !settingsButton?.contains(event.target as Node)) {
                onClose();
            }
        };

        const settingsButton = document.getElementById('settings-button');
        if (settingsButton) {
            const rect = settingsButton.getBoundingClientRect();
            if (popoverRef.current) {
                popoverRef.current.style.top = `${rect.bottom + 8}px`;
                popoverRef.current.style.right = `${window.innerWidth - rect.right}px`;
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);
    
    const handleValueChange = (key: keyof ImageSettings, value: any) => {
        onChange({ [key]: value });
        setActiveSubMenu(null);
    };
    
    const handleMultiRefChange = (key: keyof ImageSettings, action: 'add' | 'remove', value: string | number) => {
        const currentUrls = (settings[key] as string[] || []);
        let newUrls: string[];

        if (action === 'add') {
            newUrls = [...currentUrls, value as string];
        } else {
            newUrls = currentUrls.filter((_, i) => i !== value);
        }
        onChange({ [key]: newUrls });
    };

    const totalRefs = (settings.subjectRefUrls?.length || 0) + (settings.sceneryRefUrls?.length || 0) + (settings.styleRefUrls?.length || 0);
    const isConsistencyDisabled = totalRefs > 3;

    const renderSubMenu = (menuKey: SubMenu, title: string) => {
        const currentOptions = menuKey === 'aspectRatio' && settings.isConsistent
            ? options.aspectRatio.filter(o => consistentAspectRatios.includes(o.value))
            : options[menuKey];

        return (
             <ul className="py-1">
                <li onClick={() => setActiveSubMenu(null)}>
                    <div className="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center cursor-pointer font-bold border-b dark:border-gray-600">
                        <BackIcon className="w-5 h-5 inline -ml-1 mr-2" />
                        <span>{title}</span>
                    </div>
                </li>
                {currentOptions.map(opt => (
                     <li key={opt.value} onClick={() => handleValueChange(menuKey as keyof ImageSettings, opt.value)}>
                        <div className="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-between cursor-pointer">
                            <span>{opt.label}</span>
                             {settings[menuKey] === opt.value && <CheckIcon className="w-5 h-5 text-blue-500" />}
                        </div>
                    </li>
                ))}
            </ul>
        );
    }
    
    const MainMenuOption: React.FC<{title: string, value: string, onClick: () => void, isDisabled?: boolean}> = ({ title, value, onClick, isDisabled }) => (
        <li onClick={!isDisabled ? onClick : undefined} className={isDisabled ? 'opacity-50' : ''}>
            <div className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between ${!isDisabled ? 'hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer' : 'cursor-not-allowed'}`}>
                <span className="text-gray-800 dark:text-gray-200">{title}</span>
                <div className="flex items-center gap-2">
                     <span className="text-gray-500 dark:text-gray-400 capitalize">{value}</span>
                     {isDisabled ? (
                        <LockClosedIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </div>
        </li>
    );
    
    const renderMainMenu = () => (
        <ul className="py-1 divide-y divide-gray-200 dark:divide-gray-700">
            <MainMenuOption 
                title="Quality" 
                value={options.quality.find(q => q.value === settings.quality)?.label || 'N/A'}
                onClick={() => setActiveSubMenu('quality')}
                isDisabled={settings.isConsistent}
            />
             <li onClick={() => setView('reference')}>
                <div className="w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                    <span className="text-gray-800 dark:text-gray-200">Image Reference</span>
                    <div className="flex items-center gap-2">
                         <span className="text-gray-500 dark:text-gray-400 capitalize">{totalRefs} selected</span>
                         <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </li>
            <li className="px-4 py-3 text-sm">
                 <label htmlFor="consistency-toggle" className={`flex items-center justify-between ${isConsistencyDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <span className={`text-gray-800 dark:text-gray-200 ${isConsistencyDisabled ? 'opacity-50' : ''}`}>Image Consistency</span>
                    <div className="relative inline-flex items-center h-6 rounded-full w-11">
                        <input
                            type="checkbox"
                            id="consistency-toggle"
                            className="sr-only peer"
                            checked={settings.isConsistent}
                            disabled={isConsistencyDisabled}
                            onChange={(e) => onChange({ isConsistent: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                </label>
                {isConsistencyDisabled && !settings.isConsistent && (
                    <div className="flex items-start gap-1.5 mt-2 text-xs text-red-500">
                        <InfoIcon className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                        <span>Nonaktif karena total referensi melebihi 3 gambar.</span>
                    </div>
                )}
            </li>
            <MainMenuOption 
                title="Style" 
                value={(options.style.find(s => s.value === settings.style)?.label || settings.style).replace('-', ' ')}
                onClick={() => setActiveSubMenu('style')}
            />
            <MainMenuOption 
                title="Aspect Ratio" 
                value={options.aspectRatio.find(ar => ar.value === settings.aspectRatio)?.label || settings.aspectRatio}
                onClick={() => setActiveSubMenu('aspectRatio')}
            />
            <MainMenuOption 
                title="Camera Angle" 
                value={settings.cameraAngle.replace('-', ' ')}
                onClick={() => setActiveSubMenu('cameraAngle')}
            />
            <MainMenuOption 
                title="Shot Type" 
                value={settings.shotType.replace('-', ' ')}
                onClick={() => setActiveSubMenu('shotType')}
            />
        </ul>
    );

    const renderReferenceMenu = () => (
        <div className="animate-fade-in">
            <div onClick={() => setView('main')} className="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center cursor-pointer font-bold border-b dark:border-gray-600">
                <BackIcon className="w-5 h-5 inline -ml-1 mr-2" />
                <span>Image Reference Settings</span>
            </div>
            <div className="p-4 space-y-4">
                 <MultiReferenceUpload 
                    label="Subject Reference" 
                    urls={settings.subjectRefUrls || []}
                    onAdd={(url) => handleMultiRefChange('subjectRefUrls', 'add', url)}
                    onRemove={(idx) => handleMultiRefChange('subjectRefUrls', 'remove', idx)}
                    limit={5}
                    isDisabled={settings.isConsistent && totalRefs >= 3}
                />
                <MultiReferenceUpload 
                    label="Scenery Reference" 
                    urls={settings.sceneryRefUrls || []}
                    onAdd={(url) => handleMultiRefChange('sceneryRefUrls', 'add', url)}
                    onRemove={(idx) => handleMultiRefChange('sceneryRefUrls', 'remove', idx)}
                    limit={5}
                    isDisabled={settings.isConsistent && totalRefs >= 3}
                />
                 <MultiReferenceUpload 
                    label="Style Reference" 
                    urls={settings.styleRefUrls || []}
                    onAdd={(url) => handleMultiRefChange('styleRefUrls', 'add', url)}
                    onRemove={(idx) => handleMultiRefChange('styleRefUrls', 'remove', idx)}
                    limit={5}
                    isDisabled={settings.isConsistent && totalRefs >= 3}
                />
            </div>
        </div>
    );
    
    return (
        <div 
            ref={popoverRef}
            className="fixed w-full max-w-xs bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 z-30 animate-fade-in-down overflow-hidden transition-all duration-300"
        >
            {view === 'main' ? (
                activeSubMenu 
                    ? renderSubMenu(activeSubMenu, activeSubMenu.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())) 
                    : renderMainMenu()
            ) : (
                renderReferenceMenu()
            )}
        </div>
    );
};

export default ImageSettingsPopover;