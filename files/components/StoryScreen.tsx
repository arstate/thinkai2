import React from 'react';
import { User, AIContact } from '../../types';

interface StoryScreenProps {
    user: User;
    onAddStory: () => void;
    onViewStory: () => void;
    // contactsWithStories: AIContact[];
    // onViewAIStory: (contactId: string) => void;
}

const UserPlaceholderIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
    </svg>
);

const AddIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
);


const StoryScreen: React.FC<StoryScreenProps> = ({ user, onAddStory, onViewStory }) => {
    
    const hasStories = user.stories && user.stories.length > 0;

    const handleMyStatusClick = () => {
        if (hasStories) {
            onViewStory();
        } else {
            onAddStory();
        }
    }

    return (
        <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-800">
            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* My Status */}
                <section>
                    <div onClick={handleMyStatusClick} className="flex items-center gap-4 p-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <div className="relative">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 ${hasStories ? 'ring-2 ring-offset-2 ring-blue-500 ring-offset-gray-100 dark:ring-offset-gray-800' : ''}`}>
                                {user.profilePicUrl ? (
                                    <img src={user.profilePicUrl} alt="Status Saya" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <UserPlaceholderIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                )}
                            </div>
                             {!hasStories && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center border-2 border-gray-100 dark:border-gray-800">
                                    <AddIcon className="w-4 h-4" />
                                </div>
                             )}
                        </div>
                        <div>
                            <p className="font-bold text-lg text-gray-800 dark:text-white">Status Saya</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {hasStories ? 'Ketuk untuk melihat pembaruan' : 'Ketuk untuk menambahkan pembaruan'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Recent Updates Placeholder */}
                <section>
                    <h2 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider px-2 mb-2">
                        Terbaru
                    </h2>
                     <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <p>Story dari teman-teman AI akan muncul di sini.</p>
                        <p className="text-xs mt-1">(Fitur ini akan datang di update selanjutnya!)</p>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default StoryScreen;