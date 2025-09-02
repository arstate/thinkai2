
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  replyingToMessage: Message | null;
  onClearReply: () => void;
  formContainerClassName?: string;
  placeholder?: string;
}

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


const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, replyingToMessage, onClearReply, formContainerClassName, placeholder }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submitMessage = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
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
      <div className={formContainerClassName || ''}>
        {replyingToMessage && (
            <div className="relative bg-gray-100 dark:bg-gray-700 p-2 pr-8 mb-2 rounded-lg text-sm border-l-4 border-blue-500 animate-fade-in-down">
                <p className="font-semibold text-gray-800 dark:text-white">Membalas AI</p>
                <p className="truncate text-gray-600 dark:text-gray-300">{replyingToMessage.imageUrl ? 'Gambar' : replyingToMessage.text}</p>
                <button 
                  onClick={onClearReply} 
                  className="absolute top-1/2 -translate-y-1/2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Batal membalas"
                >
                    <CloseIcon className="w-5 h-5"/>
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-start space-x-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ketik pesan lo di sini..."}
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

export default ChatInput;