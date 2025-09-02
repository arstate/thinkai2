
import React, { useState, useEffect } from 'react';
import { User } from '../../types';

const UserPlaceholderIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
    </svg>
);

const CameraIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
        <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.451.246 2.59 1.486 2.59 2.969V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.483 1.139-2.723 2.59-2.969.382-.064.766-.123 1.152-.177.465-.067.87-.327 1.11-.71l.821-1.317a3.25 3.25 0 0 1 2.332-1.39ZM12 15.75a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" clipRule="evenodd" />
    </svg>
);


interface ProfileScreenProps {
    user: User;
    onUpdateUser: (updates: Partial<User>) => void;
    onGenderChangeAttempt: () => void;
    onOpenProfilePicModal: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onUpdateUser, onGenderChangeAttempt, onOpenProfilePicModal }) => {
    
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio || '');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (user.name !== name) {
                onUpdateUser({ name });
            }
        }, 500); // Debounce name update
        return () => clearTimeout(handler);
    }, [name, user.name, onUpdateUser]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (user.bio !== bio) {
                onUpdateUser({ bio });
            }
        }, 500); // Debounce bio update
        return () => clearTimeout(handler);
    }, [bio, user.bio, onUpdateUser]);

    return (
        <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
            <main className="flex-1 overflow-y-auto p-6 space-y-8">
                <section className="flex flex-col items-center">
                    <button 
                        onClick={onOpenProfilePicModal}
                        className="relative w-32 h-32 rounded-full group bg-gray-200 dark:bg-gray-700 shadow-lg"
                        aria-label="Ubah foto profil"
                    >
                        {user.profilePicUrl ? (
                            <img src={user.profilePicUrl} alt="Foto Profil" className="w-full h-full rounded-full object-cover"/>
                        ) : (
                            <UserPlaceholderIcon className="w-full h-full text-gray-400 dark:text-gray-500 p-4" />
                        )}
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <CameraIcon className="w-10 h-10 text-white" />
                        </div>
                    </button>
                </section>
                
                <section className="space-y-6">
                    <div>
                        <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama</label>
                        <input
                            type="text"
                            id="user-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="user-age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Umur</label>
                        <div id="user-age" className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 border border-transparent rounded-lg">
                            <span className="text-gray-800 dark:text-gray-200">{user.age} tahun</span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="user-gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                        <div className="flex items-center justify-between p-2 pl-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                            <span className="capitalize text-gray-800 dark:text-gray-200">{user.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
                            <button
                                onClick={onGenderChangeAttempt}
                                className="px-3 py-1 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                            >
                                Ganti
                            </button>
                        </div>
                         <p className="text-xs text-red-500 mt-1 pl-1">Peringatan: Mengganti gender akan menghapus semua data.</p>
                    </div>
                     <div>
                        <label htmlFor="user-bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                        <textarea
                            id="user-bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            placeholder="Tulis sedikit tentang dirimu..."
                            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        ></textarea>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProfileScreen;