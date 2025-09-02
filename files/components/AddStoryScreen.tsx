import React, { useState, useRef } from 'react';
import { StoryItem } from '../../types';

interface AddStoryScreenProps {
    onClose: () => void;
    onPost: (story: Omit<StoryItem, 'id' | 'timestamp'>) => void;
}

const textBgColors = [
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-green-400 to-blue-500',
    'bg-gradient-to-br from-pink-500 to-orange-400',
    'bg-gradient-to-br from-gray-700 to-gray-900',
    'bg-gradient-to-br from-red-500 to-yellow-500',
    'bg-gradient-to-br from-teal-400 to-cyan-600',
];

const CloseIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

const SendIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);

const AddStoryScreen: React.FC<AddStoryScreenProps> = ({ onClose, onPost }) => {
    const [mode, setMode] = useState<'text' | 'image'>('text');
    const [text, setText] = useState('');
    const [bgColor, setBgColor] = useState(textBgColors[0]);
    const [image, setImage] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handlePost = () => {
        if (mode === 'text' && text.trim()) {
            onPost({ type: 'text', content: text.trim(), backgroundColor: bgColor });
        } else if (mode === 'image' && image) {
            onPost({ type: 'image', content: caption.trim(), imageUrl: image });
        }
    };

    const isPostable = (mode === 'text' && text.trim()) || (mode === 'image' && image);

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col animate-fade-in">
            <header className="p-4 flex items-center justify-between text-white">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-7 h-7" /></button>
                <div className="flex bg-gray-700 rounded-full p-1 text-sm font-semibold">
                    <button onClick={() => setMode('text')} className={`px-4 py-1 rounded-full ${mode === 'text' ? 'bg-blue-500' : ''}`}>Teks</button>
                    <button onClick={() => setMode('image')} className={`px-4 py-1 rounded-full ${mode === 'image' ? 'bg-blue-500' : ''}`}>Gambar</button>
                </div>
                <div className="w-11"></div> 
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-0">
                {mode === 'text' ? (
                    <div className={`w-full h-full flex items-center justify-center rounded-lg ${bgColor} transition-colors`}>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Ketik status..."
                            className="w-full bg-transparent text-white text-3xl font-bold text-center p-4 resize-none focus:outline-none h-1/2"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center rounded-lg bg-gray-800">
                        {image ? (
                            <img src={image} alt="Pratinjau Story" className="max-w-full max-h-full object-contain rounded-md" />
                        ) : (
                            <label htmlFor="story-image-upload" className="flex flex-col items-center gap-4 text-gray-400 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16"><path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.5a.75.75 0 0 0 .5.707c1.728.423 3.284.774 4.887.953a.75.75 0 0 0 .763-.678V12.93a.75.75 0 0 1 .53-1.06l5.22-3.131a.75.75 0 0 0 0-1.318l-5.22-3.131a.75.75 0 0 1-.53-1.06V4.533Z" /><path d="M19.5 3.75a.75.75 0 0 0-1.5 0v16.5a.75.75 0 0 0 1.5 0V3.75Z" /></svg>
                                <span className="text-lg">Ketuk untuk memilih gambar</span>
                            </label>
                        )}
                        <input type="file" id="story-image-upload" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="absolute w-0 h-0 opacity-0" />
                    </div>
                )}
            </main>

            <footer className="p-4 flex items-center gap-4">
                {mode === 'text' ? (
                    <div className="flex gap-2">
                        {textBgColors.map(color => (
                            <button key={color} onClick={() => setBgColor(color)} className={`w-8 h-8 rounded-full ${color} ${bgColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}`} />
                        ))}
                    </div>
                ) : (
                    <input 
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Tambahkan caption..."
                        className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!image}
                    />
                )}
                <button onClick={handlePost} disabled={!isPostable} className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <SendIcon className="w-7 h-7" />
                </button>
            </footer>
        </div>
    );
};

export default AddStoryScreen;