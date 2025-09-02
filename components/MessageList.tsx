



import React, { useRef, useEffect } from 'react';
import { Message, StoryItem } from '../types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onReply: (message: Message) => void;
  backgroundColorClass: string;
  onImageClick: (imageUrl: string) => void;
  searchQuery: string;
  highlightedMessageId: string | null;
  onStoryReplyClick: (story: StoryItem) => void;
  isImageCreatorChat: boolean;
  isRemoveBgChat: boolean;
  isVideoGenChat: boolean;
  onRemoveBackgroundClick: (imageUrl: string) => void;
  onGenerateStoryboardImage: (messageId: string, panelIndex: number) => void;
  onDownloadScript: (message: Message) => void;
  onEditScript: (message: Message) => void;
  onGenerateShotlistFromScript: (scriptText: string) => void;
  onDownloadShotlist: (message: Message) => void;
  onEditShotlist: (message: Message) => void;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-3 my-4 justify-start">
        <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow">
            <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
        </div>
    </div>
);

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, onReply, backgroundColorClass, onImageClick, searchQuery, highlightedMessageId, onStoryReplyClick, isImageCreatorChat, isRemoveBgChat, isVideoGenChat, onRemoveBackgroundClick, onGenerateStoryboardImage, onDownloadScript, onEditScript, onGenerateShotlistFromScript, onDownloadShotlist, onEditShotlist }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only autoscroll if not in search mode
    if (scrollRef.current && !searchQuery) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, searchQuery]);

  return (
    <div ref={scrollRef} className={`flex-1 p-4 sm:p-6 overflow-y-auto ${backgroundColorClass} transition-colors duration-1000 ease-in-out`}>
      {messages.map((msg) => (
        <MessageBubble 
            key={msg.id} 
            message={msg} 
            onReply={onReply} 
            onImageClick={onImageClick} 
            searchQuery={searchQuery}
            isHighlighted={msg.id === highlightedMessageId}
            onStoryReplyClick={onStoryReplyClick}
            isImageCreatorChat={isImageCreatorChat}
            isRemoveBgChat={isRemoveBgChat}
            isVideoGenChat={isVideoGenChat}
            onRemoveBackgroundClick={onRemoveBackgroundClick}
            onGenerateStoryboardImage={onGenerateStoryboardImage}
            onDownloadScript={onDownloadScript}
            onEditScript={onEditScript}
            onGenerateShotlistFromScript={onGenerateShotlistFromScript}
            onDownloadShotlist={onDownloadShotlist}
            onEditShotlist={onEditShotlist}
        />
      ))}
      {isLoading && <TypingIndicator />}
    </div>
  );
};

export default MessageList;