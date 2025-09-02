import React, { useState, useRef } from 'react';

const UploadIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
);

const SendIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);

const CloseIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
);

interface ImageUploadInputProps {
    onSendImage: (dataUrl: string) => void;
    isLoading: boolean;
}

const ImageUploadInput: React.FC<ImageUploadInputProps> = ({ onSendImage, isLoading }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
        // Clear the input value so the same file can be selected again
        e.target.value = '';
    };
    
    const handleSend = () => {
        if (selectedImage && !isLoading) {
            onSendImage(selectedImage);
            setSelectedImage(null);
        }
    };

    const handleClear = () => {
        setSelectedImage(null);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
            {selectedImage ? (
                <div className="flex items-center gap-3 animate-fade-in">
                    <div className="relative p-1 border-2 border-gray-200 dark:border-gray-600 rounded-lg">
                        <img src={selectedImage} alt="Preview" className="w-12 h-12 rounded object-cover" />
                        <button 
                            onClick={handleClear} 
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full shadow hover:bg-red-600"
                            aria-label="Batal pilih gambar"
                        >
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-full transition-all duration-300 ease-in-out hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                        <SendIcon className="w-6 h-6" />
                        <span className="font-semibold">Kirim Gambar</span>
                    </button>
                </div>
            ) : (
                 <>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                        <UploadIcon className="w-6 h-6" />
                        <span className="font-semibold">Pilih Gambar</span>
                    </button>
                    <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                    />
                </>
            )}
        </div>
    );
};

export default ImageUploadInput;