

import React, { useState, useRef, useEffect } from 'react';
import { VideoGenSettings } from '../types';
import { enhanceVideoPrompt } from '../services/geminiService';

const SendIcon: React.FC<{className: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /> </svg> );
const CloseIcon: React.FC<{className: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /> </svg> );
const SparklesIcon: React.FC<{className: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.11a.75.75 0 0 0 .42 1.285l4.345.667 1.98 4.52.744 1.691a.75.75 0 0 0 1.448 0l.744-1.691 1.98-4.52 4.345-.667a.75.75 0 0 0 .42-1.285l-3.423-3.11-4.753-.39-1.83-4.401Z" clipRule="evenodd" /></svg>);
const UploadIcon: React.FC<{className: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" /></svg>);

interface VideoChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  settings: VideoGenSettings;
  onSettingsChange: (newSettings: Partial<VideoGenSettings>) => void;
}

const VideoChatInput: React.FC<VideoChatInputProps> = ({ onSendMessage, isLoading, settings, onSettingsChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitMessage = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleEnhance = async () => {
    if (!inputValue.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
        const enhanced = await enhanceVideoPrompt(inputValue);
        setInputValue(enhanced);
    } finally {
        setIsEnhancing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            onSettingsChange({ imageRefUrl: event.target?.result as string });
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="md:max-w-6xl md:mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Model Selector */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1 text-xs font-semibold">
                        {(['veo-2', 'veo-3'] as const).map(m => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => onSettingsChange({ videoModel: m })}
                                className={`px-3 py-1 rounded-full capitalize transition-colors ${settings.videoModel === m ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                {m.replace('-', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Orientation Selector */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1 text-xs font-semibold">
                        {(['landscape', 'portrait', 'square'] as const).map(o => (
                            <button
                                key={o}
                                type="button"
                                onClick={() => onSettingsChange({ orientation: o })}
                                className={`px-3 py-1 rounded-full capitalize transition-colors ${settings.orientation === o ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                {o}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleEnhance}
                    disabled={isLoading || isEnhancing || !inputValue.trim()}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors disabled:opacity-50"
                >
                    <SparklesIcon className="w-4 h-4" />
                    {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
                </button>
            </div>

            {settings.imageRefUrl && (
                 <div className="relative w-20 h-20 p-1 mb-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg animate-fade-in">
                    <img src={settings.imageRefUrl} alt="Preview" className="w-full h-full rounded object-cover" />
                    <button 
                        onClick={() => onSettingsChange({ imageRefUrl: undefined })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full shadow hover:bg-red-600"
                        aria-label="Remove image reference"
                    >
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
          
            <form onSubmit={(e) => { e.preventDefault(); submitMessage(); }} className="flex items-start space-x-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-gray-500 dark:text-gray-400 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
                <UploadIcon className="w-6 h-6" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMessage(); } }}
                placeholder="Describe the video you want to create..."
                className="flex-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none overflow-y-auto max-h-32"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full transition-all duration-300 ease-in-out hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transform hover:scale-110 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <SendIcon className="w-6 h-6" />
              </button>
            </form>
        </div>
    </div>
  );
};

export default VideoChatInput;