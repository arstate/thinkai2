
import React from 'react';

interface ImagePreviewModalProps {
    imageUrl: string;
    onClose: () => void;
}

const DownloadIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
);

const CloseIcon: React.FC<{ className: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
    
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `ai-photo-${Date.now()}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                <div className="flex-1 flex items-center justify-center min-h-0">
                    <img src={imageUrl} alt="AI Generated Preview" className="max-w-full max-h-full object-contain rounded-md" />
                </div>
                
                <div className="absolute top-3 right-3 flex flex-col gap-3">
                     <button 
                        onClick={onClose} 
                        className="text-white bg-black/60 hover:bg-black/90 p-2 rounded-full transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Tutup"
                    >
                       <CloseIcon className="h-6 w-6"/>
                    </button>
                    <button 
                        onClick={handleDownload} 
                        className="text-white bg-black/60 hover:bg-black/90 p-2 rounded-full transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Unduh Gambar"
                    >
                       <DownloadIcon className="h-6 w-6"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImagePreviewModal;