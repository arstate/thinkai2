import React, { useRef } from 'react';

// Icons
const CloseIcon: React.FC<{ className: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const DownloadIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 1.5a.75.75 0 0 1 .75.75V12.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V2.25A.75.75 0 0 1 12 1.5Z" />
        <path d="M3.75 16.5a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75Z" />
    </svg>
);
const EditIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
    </svg>
);
const DeleteIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9ZM12 3.25a.75.75 0 0 1 .75.75v.008l.008-.008a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008l.008-.008a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008l.008-.008a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008l.008-.008a.75.75 0 0 1 .75-.75H12Z" clipRule="evenodd" />
    </svg>
);

const UserPlaceholderIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
    </svg>
);


interface UserProfilePicModalProps {
    imageUrl?: string;
    onClose: () => void;
    onUpdateImage: (dataUrl: string) => void;
    onDeleteImage: () => void;
}

const UserProfilePicModal: React.FC<UserProfilePicModalProps> = ({ imageUrl, onClose, onUpdateImage, onDeleteImage }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof e.target?.result === 'string') {
                    onUpdateImage(e.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `user-profile-pic-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDeleteImage();
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="relative p-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-11/12 max-h-[90vh] transform animate-scale-in flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-1 flex items-center justify-center">
                    {imageUrl ? (
                        <img src={imageUrl} alt="User Profile Preview" className="max-w-full max-h-[calc(90vh-100px)] object-contain rounded-md" />
                    ) : (
                        <UserPlaceholderIcon className="w-48 h-48 text-gray-300 dark:text-gray-600"/>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-center items-center gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-b-lg">
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                        aria-label="Ganti Foto"
                    >
                        <EditIcon className="w-5 h-5" />
                        <span>Ganti</span>
                    </button>
                    {imageUrl && (
                        <>
                             <button 
                                onClick={handleDownload} 
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                                aria-label="Unduh Foto"
                            >
                                <DownloadIcon className="w-5 h-5" />
                                <span>Unduh</span>
                            </button>
                            <button 
                                onClick={handleDelete} 
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                                aria-label="Hapus Foto"
                            >
                                <DeleteIcon className="w-5 h-5" />
                                <span>Hapus</span>
                            </button>
                        </>
                    )}
                </div>

                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-white bg-black/60 hover:bg-black/90 p-2 rounded-full transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Tutup"
                >
                   <CloseIcon className="h-6 w-6"/>
                </button>
                
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="absolute w-0 h-0 opacity-0" />
            </div>
        </div>
    );
};

export default UserProfilePicModal;