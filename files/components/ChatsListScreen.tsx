import React, { useMemo } from 'react';
import { AIContact } from '../../types';

interface ChatsListScreenProps {
    contacts: AIContact[];
    onSelectContact: (id: string) => void;
}

const ChatIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-14.304 0c-1.978-.292-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97Z" clipRule="evenodd" />
    </svg>
);

const EmptyState: React.FC = () => (
    <div className="text-center p-8 flex flex-col items-center justify-center h-full animate-fade-in">
        <div className="w-28 h-28 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <ChatIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Mulai Obrolan Baru</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-xs">
            Kamu belum punya teman ngobrol. Yuk, tambahkan teman AI pertamamu dengan menekan tombol <span className="font-bold text-blue-500">(+)</span> di pojok kanan bawah!
        </p>
    </div>
);

const ContactItem: React.FC<{ contact: AIContact; onSelect: () => void }> = ({ contact, onSelect }) => {
    const lastMessage = contact.messages.length > 0 ? contact.messages[contact.messages.length - 1] : null;

    const lastMessageText = lastMessage?.text || (lastMessage?.imageUrl ? 'Gambar' : 'Mulai percakapan...');
    const formattedTime = lastMessage
        ? new Date(lastMessage.timestamp).toLocaleTimeString(navigator.language, {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';
    
    const isUnread = contact.unreadCount > 0;

    return (
        <li onClick={onSelect} className="flex items-center p-4 space-x-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg">
            <img src={contact.profilePicUrl} alt={contact.name} className="w-14 h-14 rounded-full object-cover bg-gray-300 shadow-sm" />
            <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-gray-800 dark:text-white truncate">{contact.name}</p>
                <p className={`text-sm truncate ${isUnread ? 'text-gray-700 dark:text-gray-200 font-semibold' : 'text-gray-500 dark:text-gray-400'} ${!lastMessage ? 'italic' : ''}`}>
                    {lastMessageText}
                </p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0 space-y-1 self-start pt-1">
                 <p className={`text-xs ${isUnread ? 'font-bold text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}>{formattedTime}</p>
                 {isUnread ? (
                    <span className="w-5 h-5 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center justify-center shadow">
                        {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
                    </span>
                 ) : (
                    <div className="w-5 h-5"></div> // Placeholder to keep alignment
                 )}
            </div>
        </li>
    );
};


const ChatsListScreen: React.FC<ChatsListScreenProps> = ({ contacts, onSelectContact }) => {
    
    const sortedContacts = useMemo(() => {
        return [...contacts].sort((a, b) => {
            if (!a || !a.messages || a.messages.length === 0) return 1;
            if (!b || !b.messages || b.messages.length === 0) return -1;
            const lastMsgA = a.messages[a.messages.length - 1];
            const lastMsgB = b.messages[b.messages.length - 1];
            if (!lastMsgA || !lastMsgA.timestamp) return 1;
            if (!lastMsgB || !lastMsgB.timestamp) return -1;
            return new Date(lastMsgB.timestamp).getTime() - new Date(lastMsgA.timestamp).getTime();
        });
    }, [contacts]);

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 relative">
            <main className="flex-1 overflow-y-auto p-2">
                {contacts.length === 0 ? (
                    <EmptyState />
                ) : (
                    <ul className="space-y-1">
                        {sortedContacts.map(contact => (
                            <ContactItem key={contact.id} contact={contact} onSelect={() => onSelectContact(contact.id)} />
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
};

export default ChatsListScreen;