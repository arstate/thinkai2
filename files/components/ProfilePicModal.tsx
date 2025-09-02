import React, { useMemo } from 'react';
import { Message, MessageSender } from '../../types';

interface RemoveBgProfileProps {
    name: string;
    profilePicUrl: string;
    messages: Message[];
    onClose: () => void;
    onImageClick: (imageUrl: string) => void;
}

const BackIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
);

const EmptyStateIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M1.5 6a3 3 0 0 1 3-3h15a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H4.5a3 3 0 0 1-3-3V6Zm19.5 0a1.5 1.5 0 0 0-1.5-1.5H4.5A1.5 1.5 0 0 0 3 6v12a1.5 1.5 0 0 0 1.5 1.5h15a1.5 1.5 0 0 0 1.5-1.5V6Z" />
        <path d="M6.75 12a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Z" />
        <path d="M12 9.75a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-.75-.75Z" />
    </svg>
);


const RemoveBgProfile: React.FC<RemoveBgProfileProps> = ({ name, profilePicUrl, messages, onClose, onImageClick }) => {
    const images = useMemo(() => {
        // Hanya tampilkan gambar yang dikirim oleh AI (hasil remove background)
        return messages
            .filter(msg => msg.imageUrl && msg.sender === MessageSender.AI)
            .map(msg => msg.imageUrl!);
    }, [messages]);
    
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
                     <p className="text-sm text-gray-500 dark:text-gray-400">Riwayat Gambar</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-2">
                {images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                        <EmptyStateIcon className="w-24 h-24 mb-4" />
                        <h2 className="text-xl font-bold">Belum Ada Gambar Hasil</h2>
                        <p>Gambar yang sudah dihapus backgroundnya akan muncul di sini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-1">
                        {[...images].reverse().map((image, index) => (
                            <button
                                key={index}
                                onClick={() => onImageClick(image)}
                                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-sm overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                            >
                                <img
                                    src={image}
                                    alt={`Processed image ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default RemoveBgProfile;