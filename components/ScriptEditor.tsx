

import React, { useState } from 'react';
import { downloadScriptAsPDF } from '../utils/pdf';

interface EditableScript {
    messageId: string;
    text: string;
    title: string;
    author: string;
    logline: string;
    synopsis: string;
}

interface ScriptEditorProps {
    script: EditableScript;
    onClose: () => void;
    onSave: (messageId: string, updates: { title: string; author: string; logline: string; synopsis: string; text: string }) => void;
}

const CloseIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
);

const DownloadIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.905 3.079V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
);

const SaveIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" />
      <path d="M6 14a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H6Z" />
    </svg>
);


const ScriptEditor: React.FC<ScriptEditorProps> = ({ script, onClose, onSave }) => {
    const [editedTitle, setEditedTitle] = useState(script.title);
    const [editedAuthor, setEditedAuthor] = useState(script.author);
    const [editedLogline, setEditedLogline] = useState(script.logline);
    const [editedSynopsis, setEditedSynopsis] = useState(script.synopsis);
    const [editedText, setEditedText] = useState(script.text);
    const [hasChanges, setHasChanges] = useState(false);

    const handleSave = () => {
        onSave(script.messageId, {
            title: editedTitle,
            author: editedAuthor,
            logline: editedLogline,
            synopsis: editedSynopsis,
            text: editedText,
        });
        setHasChanges(false);
    };

    const handleDownload = () => {
        downloadScriptAsPDF(
            editedText, 
            editedTitle,
            editedAuthor,
            editedLogline,
            editedSynopsis,
            `script-edited-${script.messageId}.pdf`
        );
    };
    
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setter(e.target.value);
        setHasChanges(true);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex flex-col animate-fade-in">
            <header className="p-4 flex items-center justify-between text-white bg-gray-800 border-b border-gray-700 shrink-0">
                <h2 className="text-lg font-bold truncate pr-4">{editedTitle || "Edit Script"}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={handleSave} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        <SaveIcon className="w-4 h-4" />
                        Save
                    </button>
                     <button 
                        onClick={handleDownload}
                        disabled={hasChanges}
                        className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                     >
                        <DownloadIcon className="w-4 h-4" />
                        Download
                    </button>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
                <div className="w-full max-w-4xl h-full bg-white text-black shadow-2xl overflow-y-auto font-['Courier_New',_Courier,_monospace]">
                    <div className="p-8 md:p-16 space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">Title</label>
                            <input 
                                type="text"
                                value={editedTitle}
                                onChange={handleInputChange(setEditedTitle)}
                                className="w-full p-2 border bg-gray-100 dark:bg-gray-700/50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                            />
                        </div>
                         <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">Written By</label>
                            <input 
                                type="text"
                                value={editedAuthor}
                                onChange={handleInputChange(setEditedAuthor)}
                                className="w-full p-2 border bg-gray-100 dark:bg-gray-700/50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">Logline</label>
                            <input
                                type="text"
                                value={editedLogline}
                                onChange={handleInputChange(setEditedLogline)}
                                className="w-full p-2 border bg-gray-100 dark:bg-gray-700/50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">Synopsis</label>
                            <textarea
                                value={editedSynopsis}
                                onChange={handleInputChange(setEditedSynopsis)}
                                rows={4}
                                className="w-full p-2 border bg-gray-100 dark:bg-gray-700/50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-justify"
                            />
                        </div>
                         <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">Script</label>
                            <textarea
                                value={editedText}
                                onChange={handleInputChange(setEditedText)}
                                className="w-full min-h-[50vh] p-2 border bg-gray-100 dark:bg-gray-700/50 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-6 resize-y text-justify"
                                placeholder="Mulai tulis skripmu di sini..."
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ScriptEditor;