

import React, { useState, useRef, useEffect } from 'react';
import { Shotlist, ShotlistItem } from '../types';
import { downloadShotlistAsPDF } from '../utils/pdf';

const CloseIcon: React.FC<{className: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /> </svg> );
const DownloadIcon: React.FC<{className: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.905 3.079V2.75Z" /> <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" /> </svg> );
const SaveIcon: React.FC<{className: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" /> <path d="M6 14a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H6Z" /> </svg> );
const DeleteIcon: React.FC<{className: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75V4.5h8V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 10.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75ZM8.5 11.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5ZM12.25 11.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /><path d="M18 6a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h16Z" /></svg>);

interface ShotlistEditorProps {
    shotlist: Shotlist & { messageId: string };
    onClose: () => void;
    onSave: (messageId: string, updatedShotlist: Shotlist) => void;
}

const parseSceneShot = (sceneShot: string): [string, string] => {
    if (!sceneShot || typeof sceneShot !== 'string') return ['', ''];
    const sceneMatch = sceneShot.match(/scene (\d+)/i);
    const shotMatch = sceneShot.match(/shot (\d+)/i);
    return [
        sceneMatch ? sceneMatch[1] : '',
        shotMatch ? shotMatch[1] : ''
    ];
};

// A helper component for auto-resizing textareas
const AutoResizingTextarea: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    className?: string;
    name: string;
    rows?: number;
}> = ({ value, onChange, className, name, rows = 1 }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Adjust height on value change
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scroll height
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            name={name}
            value={value}
            onChange={onChange}
            className={className}
            rows={rows}
        />
    );
};


const ShotlistEditor: React.FC<ShotlistEditorProps> = ({ shotlist, onClose, onSave }) => {
    const [editedData, setEditedData] = useState<Shotlist>(JSON.parse(JSON.stringify(shotlist)));
    const [hasChanges, setHasChanges] = useState(false);

    const handleSave = () => {
        onSave(shotlist.messageId, editedData);
        setHasChanges(false);
    };

    const handleDownload = () => {
        downloadShotlistAsPDF(editedData, editedData.director, `shotlist-edited-${shotlist.messageId}.pdf`);
    };

    const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setHasChanges(true);
    };

    const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newItems = [...editedData.items];
        const itemToUpdate = { ...newItems[index] };

        if (name === 'scene' || name === 'shot') {
            const [currentScene, currentShot] = parseSceneShot(itemToUpdate.sceneShot);
            const newScene = name === 'scene' ? value : currentScene;
            const newShot = name === 'shot' ? value : currentShot;
            itemToUpdate.sceneShot = `scene ${newScene || '1'}-shot ${newShot || '1'}`;
        } else if (type === 'checkbox') {
            (itemToUpdate as any)[name] = (e.target as HTMLInputElement).checked;
        } else {
            (itemToUpdate as any)[name] = value;
        }

        newItems[index] = itemToUpdate;
        setEditedData(prev => ({ ...prev, items: newItems }));
        setHasChanges(true);
    };

    const addRow = () => {
        const lastItem = editedData.items[editedData.items.length - 1];
        let newSceneShot = 'scene 1-shot 1';
        if(lastItem && lastItem.sceneShot) {
            const [scene, shot] = parseSceneShot(lastItem.sceneShot);
             if (scene && shot) {
                const sceneNum = parseInt(scene, 10);
                const shotNum = parseInt(shot, 10);
                newSceneShot = `scene ${sceneNum}-shot ${shotNum + 1}`;
            }
        }
    
        const newItem: ShotlistItem = {
            sceneShot: newSceneShot,
            shotSize: '', movement: '', gear: '', location: '', extInt: 'INT',
            notes: '', preferred: false, duration: '00:00:10', sound: true
        };
        setEditedData(prev => ({ ...prev, items: [...prev.items, newItem] }));
        setHasChanges(true);
    };

    const removeRow = (index: number) => {
        setEditedData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
        setHasChanges(true);
    };

    const inputClasses = "w-full bg-transparent text-black dark:text-gray-100 p-1 focus:outline-none";
    const metaInputClasses = "inline-block p-1 ml-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 text-black dark:text-white font-normal focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm";
    
    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col animate-fade-in font-sans">
            <header className="sticky top-0 z-30 shrink-0 p-3 flex items-center justify-between text-white bg-gray-800 border-b border-gray-700">
                <h2 className="text-lg font-bold truncate pr-4">{editedData.productionTitle || "Edit Shotlist"}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={handleSave} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"> <SaveIcon className="w-4 h-4" /> Save </button>
                    <button onClick={handleDownload} disabled={hasChanges} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"> <DownloadIcon className="w-4 h-4" /> Download </button>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"> <CloseIcon className="w-6 h-6" /> </button>
                </div>
            </header>
            
            <div className="sticky top-[61px] z-20 shrink-0 bg-white dark:bg-gray-800 text-black dark:text-white font-mono text-xs">
                <div className="bg-black text-white p-2 flex justify-between items-center">
                    <h3 className="font-bold text-base">Camera Shot List</h3>
                </div>
                <div className="p-2 border-b border-black dark:border-gray-600 grid grid-cols-2 gap-x-4">
                    <div>
                        <p className="font-bold">Title:<input type="text" name="productionTitle" value={editedData.productionTitle} onChange={handleMetaChange} className={metaInputClasses}/></p>
                        <p className="font-bold">Director:<input type="text" name="director" value={editedData.director} onChange={handleMetaChange} className={metaInputClasses}/></p>
                        <p className="font-bold">Locations:<input type="text" name="locations" value={editedData.locations} onChange={handleMetaChange} className={metaInputClasses}/></p>
                    </div>
                    <div className="text-right">
                       <p><strong className="font-bold">Sheet #</strong></p>
                       <p><strong className="font-bold">Date:</strong> {new Date().toLocaleDateString('en-GB')}</p>
                       <p><strong className="font-bold">Total Scenes:</strong> {new Set(editedData.items.map(i => i.sceneShot.match(/scene (\d+)/i)?.[1] || '0')).size}</p>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-auto">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px] border-collapse bg-white dark:bg-gray-800 text-black dark:text-gray-200 font-mono text-xs">
                        <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0 z-10">
                            <tr className="border-b border-black dark:border-gray-600">
                                {['', 'Scene', 'Shot', 'Shot Size', 'Movement', 'Gear', 'Location', 'EXT/INT', 'Notes', 'Preferred', 'Duration', 'Sound'].map(h => <th key={h} className="p-1 border-x border-black/50 dark:border-gray-600 font-bold">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                        {editedData.items.map((item, index) => {
                            const [scene, shot] = parseSceneShot(item.sceneShot);
                            return (
                            <tr key={index} className="border-b border-black/20 dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-900/40">
                                <td className="p-1 border-x border-black/20 dark:border-gray-700 text-center"><button onClick={() => removeRow(index)} className="text-red-500 hover:text-red-700 p-0.5"><DeleteIcon className="w-4 h-4"/></button></td>
                                <td className="p-0 border-x border-black/20 dark:border-gray-700 w-20"><input type="number" name="scene" value={scene} onChange={(e) => handleItemChange(index, e)} className={`${inputClasses} text-center`}/></td>
                                <td className="p-0 border-x border-black/20 dark:border-gray-700 w-20"><input type="number" name="shot" value={shot} onChange={(e) => handleItemChange(index, e)} className={`${inputClasses} text-center`}/></td>
                                <td className="p-0 border-x border-black/20 dark:border-gray-700"><input type="text" name="shotSize" value={item.shotSize} onChange={(e) => handleItemChange(index, e)} className={inputClasses}/></td>
                                <td className="p-0 border-x border-black/20 dark:border-gray-700"><input type="text" name="movement" value={item.movement} onChange={(e) => handleItemChange(index, e)} className={inputClasses}/></td>
                                <td className="p-0 border-x border-black/20 dark:border-gray-700"><input type="text" name="gear" value={item.gear} onChange={(e) => handleItemChange(index, e)} className={inputClasses}/></td>
                                <td className="p-0 border-x border-black/20 dark:border-gray-700"><input type="text" name="location" value={item.location} onChange={(e) => handleItemChange(index, e)} className={inputClasses}/></td>
                                <td className="p-0 border-x border-black/20 dark:border-gray-700 text-center">
                                    <select name="extInt" value={item.extInt} onChange={(e) => handleItemChange(index, e)} className={`${inputClasses} text-center dark:bg-gray-800`}>
                                        <option className="text-black bg-white dark:bg-gray-800">INT</option>
                                        <option className="text-black bg-white dark:bg-gray-800">EXT</option>
                                    </select>
                                </td>
                                <td className="p-0 border-x border-black/20 dark:border-gray-700 align-top">
                                    <AutoResizingTextarea
                                        name="notes"
                                        value={item.notes}
                                        onChange={(e) => handleItemChange(index, e)}
                                        className={`${inputClasses} resize-none overflow-y-hidden`}
                                        rows={1}
                                    />
                                </td>
                                <td className="p-1 border-x border-black/20 dark:border-gray-700 text-center"><input type="checkbox" name="preferred" checked={item.preferred} onChange={(e) => handleItemChange(index, e)} className="bg-transparent"/></td>
                                <td className="p-0 border-x border-black/20 dark:border-gray-700"><input type="text" name="duration" value={item.duration} onChange={(e) => handleItemChange(index, e)} className={`${inputClasses} text-center w-20`}/></td>
                                <td className="p-1 border-x border-black/20 dark:border-gray-700 text-center"><input type="checkbox" name="sound" checked={item.sound} onChange={(e) => handleItemChange(index, e)} className="bg-transparent"/></td>
                            </tr>
                        )})}
                        </tbody>
                    </table>
                    <div className="p-2 bg-white dark:bg-gray-800">
                         <button onClick={addRow} className="px-4 py-1 bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 hover:bg-gray-300 text-sm font-bold rounded">+ Add Row</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ShotlistEditor;
