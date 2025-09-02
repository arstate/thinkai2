
import React, { useState } from 'react';
import { Message, MessageSender } from '../../types';

interface VideoGenProfileProps {
    name: string;
    profilePicUrl: string;
    messages: Message[];
    onClose: () => void;
}

const BackIcon: React.FC<{className: string}> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /> </svg> );
const EmptyStateIcon: React.FC<{ className: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-15Zm-1.5 3a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5-1.5h-15a1.5 1.5 0 0 1-1.5-1.5v-9Z" /> <path d="M8.25 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.5 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM15.75 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" /> </svg> );
const CopyIcon: React.FC<{ className: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.121A1.5 1.5 0 0 1 17 6.621V16.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 16.5v-13Z" /> <path d="M5 5.5A1.5 1.5 0 0 0 3.5 7v9A1.5 1.5 0 0 0 5 17.5h5A1.5 1.5 0 0 0 11.5 16V7a1.5 1.5 0 0 0-1.5-1.5h-5Z" /> </svg> );
const CheckIcon: React.FC<{ className: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143Z" clipRule="evenodd" /> </svg> );

const VideoGenProfile: React.FC<VideoGenProfileProps> = ({ name, profilePicUrl, messages, onClose }) => {
    const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

    const videoMessages = messages.filter(msg => msg.sender === MessageSender.AI && msg.videoUrl);

    const handleCopy = (e: React.MouseEvent, prompt: string, messageId: string) => {
        e.stopPropagation();
        if (!prompt) return;
        navigator.clipboard.writeText(prompt);
        setCopiedPromptId(messageId);
        setTimeout(() => setCopiedPromptId(null), 2000);
    };

    return (
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 z-40 animate-fade-in flex flex-col">
            <header className="p-4 flex items-center space-x-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                <button
                    onClick={onClose}
                    aria-label="Kembali"
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                    <BackIcon className="w-6 h-6"/>
                </button>
                 <img 
                    src={profilePicUrl} 
                    alt={`Foto profil ${name}`}
                    className="w-12 h-12 rounded-full object-cover bg-gray-300 shadow-md"
                />
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">{name}</h1>
                     <p className="text-sm text-gray-500 dark:text-gray-400">Riwayat Video</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
                {videoMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                        <EmptyStateIcon className="w-24 h-24 mb-4" />
                        <h2 className="text-xl font-bold">Belum Ada Video</h2>
                        <p>Video yang kamu buat akan muncul di sini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...videoMessages].reverse().map((msg) => (
                           <div key={msg.id}>
                                <div className="aspect-video block w-full bg-black rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900">
                                    <video
                                        src={msg.videoUrl}
                                        controls
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {msg.videoPrompt && (
                                    <div className="mt-2 text-left">
                                        <p className="text-gray-700 dark:text-gray-300 text-xs line-clamp-2" title={msg.videoPrompt}>
                                            {msg.videoPrompt}
                                        </p>
                                        <button 
                                            onClick={(e) => handleCopy(e, msg.videoPrompt!, msg.id)}
                                            className="mt-2 flex items-center gap-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-1.5 px-3 rounded-md transition-colors"
                                        >
                                            {copiedPromptId === msg.id ? <CheckIcon className="w-5 h-5 text-green-400"/> : <CopyIcon className="w-5 h-5" />}
                                            <span className="text-sm">{copiedPromptId === msg.id ? 'Tersalin!' : 'Salin Prompt'}</span>
                                        </button>
                                    </div>
                                )}
                           </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default VideoGenProfile;
