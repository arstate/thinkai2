import React, { useState } from 'react';
import { Message, MessageSender, StoryItem, StoryboardPanel, Shotlist } from '../types';
import StoryboardDisplay from './StoryboardDisplay';
import ShotlistDisplay from './ShotlistDisplay';


const ReplyIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.707 3.293a1 1 0 0 1 0 1.414L5.414 7H11a7 7 0 0 1 7 7v2a1 1 0 1 1-2 0v-2a5 5 0 0 0-5-5H5.414l2.293 2.293a1 1 0 1 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0Z" clipRule="evenodd" />
    </svg>
);

const DownloadIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.905 3.079V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
);

const EditIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
    </svg>
);

const ClapperboardIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0v-4.392l1.002-.25.015.002A2.25 2.25 0 0 1 6.75 15h9.5a2.25 2.25 0 0 1 2.247-2.235l.003-.015.25-1.002V2.75a.75.75 0 0 0-1.5 0v4.392l-1.002.25-.015-.002A2.25 2.25 0 0 1 15.25 5h-9.5A2.25 2.25 0 0 1 3.5 2.75Z" />
      <path d="M3.165 2.213a.75.75 0 0 1 1.05-.22l12.75 9.5a.75.75 0 0 1 0 1.254l-12.75 9.5a.75.75 0 0 1-1.27-1.034l2.218-8.25H3.165a.75.75 0 0 1 0-1.5h2.95l-2.218-8.25a.75.75 0 0 1 .22-1.05Z" />
    </svg>
);


interface MessageBubbleProps {
  message: Message;
  onReply: (message: Message) => void;
  onImageClick: (imageUrl: string) => void;
  searchQuery: string;
  isHighlighted: boolean;
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

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onReply, onImageClick, searchQuery, isHighlighted, onStoryReplyClick, isImageCreatorChat, isRemoveBgChat, isVideoGenChat, onRemoveBackgroundClick, onGenerateStoryboardImage, onDownloadScript, onEditScript, onGenerateShotlistFromScript, onDownloadShotlist, onEditShotlist }) => {
  const isAI = message.sender === MessageSender.AI;
  const hasReply = !!message.repliedTo;
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  
  const formattedTime = new Date(message.timestamp).toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const highlightText = (text: string, query: string): React.ReactNode[] => {
    if (!query.trim() || !text) {
      return [text];
    }
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-300 dark:bg-yellow-500 text-black rounded px-1 py-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
  
  const renderFormattedScriptText = (text: string, query: string): React.ReactNode => {
    const lines = text.split('\n');
    return (
        <pre className="text-sm whitespace-pre-wrap font-sans bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            {lines.map((line, index) => {
                const isSceneHeading = line.startsWith('**') && line.endsWith('**');
                const content = isSceneHeading ? line.substring(2, line.length - 2) : line;
                const highlightedContent = highlightText(content, query);
                
                if (isSceneHeading) {
                    return <strong key={index} className="block mt-2 mb-1">{highlightedContent}</strong>;
                }
                return <span key={index}>{highlightedContent}{'\n'}</span>;
            })}
        </pre>
    );
  };

  const ReplyPreview: React.FC = () => {
    if (!hasReply || !message.repliedTo) return null;

    const commonClasses = "mb-2 p-2 rounded-lg border-l-2";
    const userReplyClasses = "bg-black/10 dark:bg-white/10 border-blue-400";
    const aiReplyClasses = "bg-gray-200 dark:bg-gray-600 border-blue-400";

    const senderTextClass = isAI ? "text-gray-600 dark:text-gray-300" : "text-white/80";
    const messageTextClass = isAI ? "text-gray-500 dark:text-gray-400" : "text-white/90";

    return (
        <div className={`${commonClasses} ${isAI ? aiReplyClasses : userReplyClasses}`}>
            <p className={`font-semibold text-xs ${senderTextClass}`}>Membalas {message.repliedTo.senderName}</p>
            <p className={`text-sm truncate ${messageTextClass}`}>
                {message.repliedTo.text}
            </p>
        </div>
    );
  };

  const StoryReplyPreview: React.FC<{ story: StoryItem }> = ({ story }) => {
    return (
      <button
        onClick={() => onStoryReplyClick(story)}
        className="mb-2 p-2 rounded-lg border-l-2 bg-gray-200 dark:bg-gray-600 border-blue-400 w-full text-left transition-colors hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Lihat story yang dibalas"
      >
        <div className="flex items-center gap-3">
          {story.type === 'image' && story.imageUrl ? (
            <img src={story.imageUrl} alt="Pratinjau Story" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
          ) : (
            <div className={`w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center text-white/50 text-xl font-bold ${story.backgroundColor || 'bg-gray-400'}`}>
                {story.content.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs text-gray-600 dark:text-gray-300">Membalas Story Anda</p>
            <p className="text-sm truncate text-gray-500 dark:text-gray-400">
              {story.type === 'image' ? (story.content || 'Gambar') : story.content}
            </p>
          </div>
        </div>
      </button>
    );
  };
  
  const handleDownloadImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!message.imageUrl) return;
    const link = document.createElement('a');
    link.href = message.imageUrl;
    link.download = `ai-image-${message.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

   const handleDownloadVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!message.videoUrl) return;
    const link = document.createElement('a');
    link.href = message.videoUrl;
    link.download = `ai-video-${message.id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveBg = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (message.imageUrl) {
          onRemoveBackgroundClick(message.imageUrl);
      }
  };

  if (message.isLoading) {
    return (
        <div className="flex items-end gap-3 my-4 justify-start">
            <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow">
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    </div>
                    {message.text && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">{message.text}</p>
                    )}
                </div>
            </div>
        </div>
    );
  }

  const hasCreativeContent = message.storyboard || message.shotlist || (message.creatorToolMode === 'script' && message.text);
  const hasContent = message.text || message.imageUrl || message.videoUrl || hasCreativeContent;
  if (!hasContent) return null;

  const isWideBubble =
    (message.storyboard || message.shotlist) ||
    (isVideoGenChat && isAI && message.videoUrl);

  const widthClasses = isWideBubble
    ? 'w-full md:max-w-4xl'
    : (isAI && (message.imageUrl || message.videoUrl)
    ? 'max-w-xs md:max-w-md'
    : 'max-w-xs md:max-w-md lg:max-w-lg');

  const highlightBubbleClasses = isHighlighted 
    ? 'ring-2 ring-offset-2 ring-blue-500 ring-offset-gray-50 dark:ring-offset-gray-800'
    : '';
    
  const justifyContentClass = isAI ? (isWideBubble ? 'justify-center' : 'justify-start') : 'justify-end';

  return (
    <div 
        id={`message-${message.id}`}
        className={`group flex items-end gap-2 my-4 ${justifyContentClass}`}
    >
      <div
        className={`${widthClasses} rounded-2xl shadow flex flex-col transition-all duration-300 ${
          isAI
            ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
            : 'bg-blue-500 text-white rounded-br-none'
        } ${!message.text && (message.imageUrl || message.videoUrl) && !isVideoGenChat ? 'p-1' : 'p-4'} ${highlightBubbleClasses}`}
      >
        {message.repliedToStory ? (
          <StoryReplyPreview story={message.repliedToStory} />
        ) : (
          <ReplyPreview />
        )}
        
        {message.videoUrl && (
            isVideoGenChat && isAI ? (
                <div className="space-y-2">
                    <div className="relative">
                        <video
                            src={message.videoUrl}
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="rounded-xl w-full h-auto object-cover bg-black"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsPromptVisible(p => !p)}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                                {isPromptVisible ? 'Sembunyikan' : 'Tampilkan'} Prompt
                            </button>
                            <button
                                onClick={handleDownloadVideo}
                                aria-label="Unduh video"
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                        {isPromptVisible && (
                            <div className="mt-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 animate-fade-in">
                                <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                    {highlightText(message.text, searchQuery)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <video
                        src={message.videoUrl}
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="rounded-xl w-full h-auto object-cover bg-black"
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2">
                        <button
                            onClick={handleDownloadVideo}
                            aria-label="Unduh video"
                            className="p-1.5 bg-black/60 text-white rounded-full transition-opacity duration-200 backdrop-blur-sm hover:bg-black/80"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )
        )}

        {message.imageUrl && (
            <div className="relative">
                <img 
                    src={message.imageUrl}
                    alt="AI generated content"
                    className="rounded-xl cursor-pointer w-full h-auto object-cover transition-transform hover:scale-105"
                    onClick={() => onImageClick(message.imageUrl!)}
                />
                 <div className="absolute bottom-2 right-2 flex items-center gap-2">
                     {isImageCreatorChat && message.sender === MessageSender.AI && message.imagePrompt !== 'background removed' && (
                        <button
                            onClick={handleRemoveBg}
                            aria-label="Hapus latar belakang"
                            className="px-2 py-1 bg-black/60 text-white text-xs font-semibold rounded-md transition-opacity duration-200 backdrop-blur-sm hover:bg-black/80"
                        >
                            remove.bg
                        </button>
                     )}
                     <button
                        onClick={handleDownloadImage}
                        aria-label="Unduh gambar"
                        className="p-1.5 bg-black/60 text-white rounded-full transition-opacity duration-200 backdrop-blur-sm hover:bg-black/80"
                    >
                        <DownloadIcon className="w-5 h-5" />
                    </button>
                 </div>
            </div>
        )}
        
        {message.text && message.creatorToolMode !== 'shotlist' && !(isVideoGenChat && message.videoUrl) && (
            message.creatorToolMode === 'script' ? (
                <div>
                  {message.scriptTitle && <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-gray-100">{message.scriptTitle}</h3>}
                  {message.logline && <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-3">{message.logline}</p>}
                  {message.synopsis && <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 border-l-2 border-gray-300 pl-3">{message.synopsis}</p>}
                  {renderFormattedScriptText(message.text, searchQuery)}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <button onClick={() => onDownloadScript(message)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors">
                          <DownloadIcon className="w-4 h-4" />
                          Download PDF
                      </button>
                      <button onClick={() => onEditScript(message)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors">
                          <EditIcon className="w-4 h-4" />
                          Preview / Edit
                      </button>
                      <button onClick={() => onGenerateShotlistFromScript(message.text)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors">
                          <ClapperboardIcon className="w-4 h-4" />
                          Gen Shotlist
                      </button>
                  </div>
                </div>
            ) : (
                <p className={`text-sm ${message.imageUrl || (message.videoUrl && !isVideoGenChat) ? 'mt-2' : ''}`} style={{ wordBreak: 'break-word' }}>
                    {message.videoUrl && !isVideoGenChat && <strong className="block mb-1">Prompt:</strong>}
                    {highlightText(message.text, searchQuery)}
                </p>
            )
        )}

        {message.storyboard && (
             <StoryboardDisplay 
                panels={message.storyboard} 
                onGenerateImage={(panelIndex) => onGenerateStoryboardImage(message.id, panelIndex)}
                onImageClick={onImageClick}
            />
        )}
        {message.shotlist && (
            <div>
              <p className="text-sm mb-2">{highlightText(message.text, searchQuery)}</p>
              <ShotlistDisplay shotlist={message.shotlist} />
              <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => onDownloadShotlist(message)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors">
                      <DownloadIcon className="w-4 h-4" />
                      Download PDF
                  </button>
                  <button onClick={() => onEditShotlist(message)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors">
                      <EditIcon className="w-4 h-4" />
                      Preview / Edit
                  </button>
              </div>
            </div>
        )}

        <div className={`text-xs mt-2 self-stretch ${isAI ? 'text-left text-gray-500 dark:text-gray-400' : 'text-right text-white/70'}`}>
            {formattedTime}
        </div>
      </div>
       {isAI && !isRemoveBgChat && (message.text || message.imageUrl) && (
          <button 
            onClick={() => onReply(message)}
            aria-label="Balas pesan ini"
            className="self-center p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
          >
              <ReplyIcon className="w-5 h-5"/>
          </button>
      )}
    </div>
  );
};

export default MessageBubble;