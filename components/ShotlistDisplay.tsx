

import React from 'react';
import { Shotlist } from '../types';

interface ShotlistDisplayProps {
    shotlist: Shotlist;
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

const ShotlistDisplay: React.FC<ShotlistDisplayProps> = ({ shotlist }) => {
    if (!shotlist || !shotlist.items) {
        return <p>Invalid shotlist data.</p>;
    }
    const { productionTitle, director, locations, items } = shotlist;

    // Calculate total time
    const totalSeconds = items.reduce((acc, item) => {
        if (!item.duration || typeof item.duration !== 'string') return acc;
        const parts = item.duration.split(':').map(Number);
        let seconds = 0;
        if (parts.length === 3) { // HH:MM:SS
            seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) { // MM:SS
            seconds = parts[0] * 60 + parts[1];
        }
        return acc + (isNaN(seconds) ? 0 : seconds);
    }, 0);

    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    
    const totalTimeFormatted = `${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    
    const getSceneNumber = (sceneShot: string): number => {
        if (!sceneShot || typeof sceneShot !== 'string') return 0;
        const match = sceneShot.match(/scene (\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
    };
    const totalScenes = new Set(items.map(item => getSceneNumber(item.sceneShot))).size;
    const currentDate = new Date().toLocaleDateString('en-GB'); // dd/mm/yy

    return (
        <div className="-mx-4">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-xs shadow-inner border-y border-black/20 dark:border-white/20">
                {/* Header */}
                <div className="bg-black text-white p-2 px-4 flex justify-between items-center">
                    <h3 className="font-bold">Camera Shot List</h3>
                    <div className="text-right">
                        <p className="font-bold">Total Time</p>
                        <p>{totalTimeFormatted}</p>
                    </div>
                </div>

                {/* Metadata */}
                <div className="p-2 px-4 border-b border-black/50 flex justify-between">
                    <div>
                        <p><span className="font-bold">Title:</span> {productionTitle}</p>
                        <p><span className="font-bold">Director:</span> {director}</p>
                        <p><span className="font-bold">Locations:</span> {locations}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-bold">Sheet #</span></p>
                        <p><span className="font-bold">Date:</span> {currentDate}</p>
                        <p><span className="font-bold">Total Scenes:</span> {totalScenes}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px] border-collapse">
                        <thead className="bg-gray-200 dark:bg-gray-700">
                            <tr className="border-y border-black/50">
                                {['Scene', 'Shot', 'Shot Size', 'Movement', 'Gear', 'Location', 'EXT/INT', 'Notes', 'Preferred', 'Duration', 'Sound'].map(header => (
                                    <th key={header} className="p-1 px-2 border-x border-black/50 font-bold">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const [scene, shot] = parseSceneShot(item.sceneShot);
                                return (
                                <tr key={index} className="border-b border-black/20 even:bg-gray-50 dark:even:bg-gray-900/40">
                                    <td className="p-1 px-2 border-x border-black/20 text-center">{scene}</td>
                                    <td className="p-1 px-2 border-x border-black/20 text-center">{shot}</td>
                                    <td className="p-1 px-2 border-x border-black/20">{item.shotSize}</td>
                                    <td className="p-1 px-2 border-x border-black/20">{item.movement}</td>
                                    <td className="p-1 px-2 border-x border-black/20">{item.gear}</td>
                                    <td className="p-1 px-2 border-x border-black/20">{item.location}</td>
                                    <td className="p-1 border-x border-black/20 text-center">{item.extInt}</td>
                                    <td className="p-1 px-2 border-x border-black/20">{item.notes}</td>
                                    <td className="p-1 border-x border-black/20 text-center">{item.preferred ? 'yes' : 'no'}</td>
                                    <td className="p-1 border-x border-black/20 text-center">{item.duration}</td>
                                    <td className="p-1 border-x border-black/20 text-center">{item.sound ? 'yes' : 'no'}</td>
                                </tr>
                            )})}
                            {Array.from({ length: Math.max(0, 10 - items.length) }).map((_, index) => (
                                <tr key={`empty-${index}`} className="border-b border-black/20 h-7 even:bg-gray-50 dark:even:bg-gray-900/40">
                                    {Array.from({ length: 11 }).map((_, cellIndex) => (
                                        <td key={cellIndex} className="p-1 border-x border-black/20"></td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="h-2 bg-teal-400"></div>
            </div>
        </div>
    );
};

export default ShotlistDisplay;