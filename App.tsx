import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Message, MessageSender, Emotion, AIGender, AIPersonality, AIContact, User, AIRole, StoryItem, AspectRatio, ImageSettings, CameraAngle, ShotType, ImageStyle, CreatorToolsMode, StoryboardPanel, Shotlist, VideoGenSettings, VideoOrientation } from './types';
import { getAIResponse, getAINudgeResponse, generateImagePrompt, generateAIImage, generateModifiedImagePrompt, getAIStoryReply, developImagePrompt, reviseImagePrompt, generateCreativeContent, enhanceVideoPrompt, generateAIVideo, generateConsistentImage } from './services/geminiService';
import { MALE_AI_PERSONAS, FEMALE_AI_PERSONAS } from './constants';
import * as dbService from './services/dbService';
import { downloadScriptAsPDF, downloadShotlistAsPDF } from './utils/pdf';
import Header from './components/Header';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import LoadingScreen from './files/components/LoadingScreen';
import ImagePreviewModal from './files/components/ImagePreviewModal';
import ConfirmationModal from './files/components/ConfirmationModal';
import ChatsListScreen from './files/components/ChatsListScreen';
import ProfileScreen from './files/components/ProfileScreen';
import UserProfilePicModal from './files/components/UserProfilePicModal';
import StoryScreen from './files/components/StoryScreen';
import AddStoryScreen from './files/components/AddStoryScreen';
import StoryViewer from './files/components/StoryViewer';
import AIToolsScreen from './files/components/AIToolsScreen';
import ImageSettingsPopover from './files/components/ImageSettingsPopover';
import ImageCreatorProfile from './files/components/ImageCreatorProfile';
import ImageUploadInput from './files/components/ImageUploadInput';
import RemoveBgProfile from './files/components/ProfilePicModal';
import ScriptEditor from './components/ScriptEditor';
import ShotlistEditor from './components/ShotlistEditor';
import VideoChatInput from './components/VideoChatInput';
import VideoGenProfile from './files/components/VideoGenProfile';


type AppState = 'SETUP' | 'LOADING_CHATS' | 'MAIN' | 'GENERATING_CONTACT' | 'CHAT';
type ActiveScreen = 'TOOLS' | 'CHATS' | 'STORY' | 'PROFILE';
type ActiveChatType = 'contact' | 'tool' | null;

const APP_STORAGE_KEY_V3 = 'ai-chat-app-v3';

interface SavedState {
    user: User;
    contacts: AIContact[];
    imageCreatorState?: {
        messages: Message[];
        generatedImages: string[];
        settings: ImageSettings;
    };
    removeBgState?: {
        messages: Message[];
    };
    creatorToolsState?: {
        messages: Message[];
        settings: { mode: CreatorToolsMode };
    };
    videoGenState?: {
        messages: Message[];
        settings: VideoGenSettings;
    };
    activeChat?: { id: string; type: ActiveChatType };
    activeScreen?: ActiveScreen;
}

const ToolsIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Z" />
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V6ZM10.5 15a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clipRule="evenodd" />
    </svg>
);


const ChatIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-14.304 0c-1.978-.292-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97Z" clipRule="evenodd" />
    </svg>
);

const StoryIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
);


const UserIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
);

const AddIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 4.5a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V5.25A.75.75 0 0 1 12 4.5Z" />
    </svg>
);

const SetupScreen: React.FC<{ onComplete: (name: string, gender: 'male' | 'female', age: number) => void }> = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [userGender, setUserGender] = useState<'male' | 'female' | null>(null);
    const [age, setAge] = useState('');

    const handleSubmit = () => {
        const ageNum = parseInt(age, 10);
        if (name.trim() && userGender && age && !isNaN(ageNum) && ageNum > 0) {
            onComplete(name.trim(), userGender, ageNum);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50 dark:bg-gray-900">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Selamat Datang!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Sebelum mulai, isi data singkat dulu ya.</p>
            <div className="w-full max-w-sm mb-4">
                 <label htmlFor="name-input" className="text-gray-600 dark:text-gray-300 mb-2 block">Siapa nama kamu?</label>
                <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ketik nama kamu di sini..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
                    aria-label="Nama Pengguna"
                />
            </div>

            <div className="w-full max-w-sm mb-4">
                 <label htmlFor="age-input" className="text-gray-600 dark:text-gray-300 mb-2 block">Berapa umur kamu?</label>
                <input
                    id="age-input"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Contoh: 21"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
                    aria-label="Umur Pengguna"
                />
            </div>

            <div className="w-full max-w-sm mb-8">
                <label className="text-gray-600 dark:text-gray-300 mb-2 block">Pilih gendermu:</label>
                <div className="flex gap-4">
                    <button
                        onClick={() => setUserGender('male')}
                        className={`w-full font-bold py-3 px-4 rounded-full shadow-lg transition-all duration-300 ${userGender === 'male' ? 'bg-blue-500 text-white ring-2 ring-offset-2 ring-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        Laki-laki
                    </button>
                     <button
                        onClick={() => setUserGender('female')}
                        className={`w-full font-bold py-3 px-4 rounded-full shadow-lg transition-all duration-300 ${userGender === 'female' ? 'bg-pink-400 text-white ring-2 ring-offset-2 ring-pink-400' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        Perempuan
                    </button>
                </div>
            </div>

             <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xs">
                AI akan menjadi lawan jenismu agar ngobrol lebih seru!
            </p>

            <button
                onClick={handleSubmit}
                disabled={!name.trim() || !userGender || !age.trim() || parseInt(age, 10) <= 0}
                className="w-full max-w-sm bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-10 rounded-full shadow-lg transform transition-transform hover:scale-105 active:scale-100 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
            >
                Simpan & Lanjutkan
            </button>
        </div>
    );
};

const emotionBackgroundColors: Record<string, string> = {
    [Emotion.NETRAL]: 'bg-gray-50 dark:bg-gray-800',
    [Emotion.SENANG]: 'bg-yellow-50 dark:bg-yellow-900/40',
    [Emotion.SEDIH]: 'bg-blue-50 dark:bg-blue-900/40',
    [Emotion.MARAH]: 'bg-red-50 dark:bg-red-900/40',
    [Emotion.BADMOOD]: 'bg-indigo-50 dark:bg-indigo-900/40',
    [Emotion.SUKA]: 'bg-pink-50 dark:bg-pink-900/40',
    [Emotion.SANGE]: 'bg-fuchsia-50 dark:bg-fuchsia-900/40',
};

const initialImageCreatorState = {
    id: 'ai-image-creator',
    name: 'Image Gen',
    profilePicUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.5a.75.75 0 0 0 .5.707c1.728.423 3.284.774 4.887.953a.75.75 0 0 0 .763-.678V12.93a.75.75 0 0 1 .53-1.06l5.22-3.131a.75.75 0 0 0 0-1.318l-5.22-3.131a.75.75 0 0 1-.53-1.06V4.533Z" /><path d="M19.5 3.75a.75.75 0 0 0-1.5 0v16.5a.75.75 0 0 0 1.5 0V3.75Z" /></svg>')}`,
    messages: [{
        id: 'tool-init-1',
        sender: MessageSender.AI,
        text: 'Hai! Jelaskan gambar apa pun yang bisa kamu bayangkan, dan aku akan membuatnya untukmu. Kamu bisa menyesuaikan pengaturan menggunakan ikon gerigi di atas.',
        timestamp: new Date()
    }] as Message[],
    generatedImages: [] as string[],
    settings: {
        quality: 'imagen-4' as 'imagen-3' | 'imagen-4',
        isConsistent: false,
        style: 'default' as ImageStyle,
        aspectRatio: '1:1' as AspectRatio,
        cameraAngle: 'default' as CameraAngle,
        shotType: 'default' as ShotType,
        subjectRefUrls: [],
        sceneryRefUrls: [],
        styleRefUrls: [],
    } as ImageSettings
};

const initialRemoveBgState = {
    id: 'ai-remove-background',
    name: 'Background Removal',
    profilePicUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" /><path d="M5.21 14.21a.75.75 0 0 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06Z" /><path d="M3.09 18.33a.75.75 0 0 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06Z" /></svg>')}`,
    messages: [{
        id: 'tool-rb-init-1',
        sender: MessageSender.AI,
        text: 'Halo! Unggah gambar untuk menghapus latar belakangnya secara otomatis.',
        timestamp: new Date()
    }] as Message[],
};

const initialCreatorToolsState = {
    id: 'ai-creator-tools',
    name: 'Creator Tools',
    profilePicUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12.75 3.75a.75.75 0 0 0-1.5 0v1.5h-1.5a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0v-1.5h1.5a.75.75 0 0 0 0-1.5h-1.5v-1.5Z" /><path fill-rule="evenodd" d="M11.025 13.435a.75.75 0 0 1 .166.511v3.229a.75.75 0 0 1-1.342.374l-2.07-4.14a.75.75 0 0 1 .14-.88l4.417-3.926a.75.75 0 0 1 1.056.09l4.667 5.163a.75.75 0 0 1-.02 1.06l-3.084 2.89a.75.75 0 0 1-1.028-.112l-2.008-2.343a.75.75 0 0 1 .006-1.042l1.018-.932-.387-.216-1.018.933Z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M3 10.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3.75a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5h-2.25a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" /></svg>')}`,
    messages: [{
        id: 'tool-ct-init-1',
        sender: MessageSender.AI,
        text: 'Selamat datang di Creator Tools! Pilih mode di atas (Script, Storyboard, atau Shotlist) dan berikan idemu. Aku akan bantu mewujudkannya.',
        timestamp: new Date()
    }] as Message[],
    settings: {
        mode: CreatorToolsMode.SCRIPT
    }
};

const initialVideoGenState = {
    id: 'ai-video-gen',
    name: 'Video Gen',
    profilePicUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-15Zm-1.5 3a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5-1.5h-15a1.5 1.5 0 0 1-1.5-1.5v-9Z" /><path d="M8.25 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.5 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM15.75 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" /></svg>')}`,
    messages: [{
        id: 'tool-vg-init-1',
        sender: MessageSender.AI,
        text: "Selamat datang di Video Gen! Deskripsikan adegan yang kamu inginkan, dan aku akan membuatnya menjadi video. Kamu juga bisa memberikan referensi gambar.",
        timestamp: new Date()
    }] as Message[],
    settings: {
        orientation: 'landscape' as VideoOrientation,
        videoModel: 'veo-2' as 'veo-2' | 'veo-3',
        imageRefUrl: undefined,
    } as VideoGenSettings
};


type EditableScript = {
    messageId: string;
    text: string;
    title: string;
    author: string;
    logline: string;
    synopsis: string;
};

type EditableShotlist = Shotlist & { messageId: string; };

export const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('SETUP');
    const [activeScreen, setActiveScreen] = useState<ActiveScreen>('CHATS');
    const [user, setUser] = useState<User | null>(null);
    const [contacts, setContacts] = useState<AIContact[]>([]);
    const [imageCreatorState, setImageCreatorState] = useState(initialImageCreatorState);
    const [removeBgState, setRemoveBgState] = useState(initialRemoveBgState);
    const [creatorToolsState, setCreatorToolsState] = useState(initialCreatorToolsState);
    const [videoGenState, setVideoGenState] = useState(initialVideoGenState);
    const [activeChat, setActiveChat] = useState<{ id: string; type: ActiveChatType }>({ id: '', type: null });
    const [editingScript, setEditingScript] = useState<EditableScript | null>(null);
    const [editingShotlist, setEditingShotlist] = useState<EditableShotlist | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // Modals and Previews
    const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
    const [isProfilePicModalOpen, setIsProfilePicModalOpen] = useState<boolean>(false);
    const [isAddingStory, setIsAddingStory] = useState<boolean>(false);
    const [isToolSettingsOpen, setIsToolSettingsOpen] = useState<boolean>(false);
    const [isToolProfileOpen, setIsToolProfileOpen] = useState<boolean>(false);
    const [isRemoveBgProfileOpen, setIsRemoveBgProfileOpen] = useState<boolean>(false);
    const [isVideGenProfileOpen, setIsVideGenProfileOpen] = useState(false);

    const [viewingStoryGroup, setViewingStoryGroup] = useState<{ stories: StoryItem[]; author: User | AIContact } | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
    const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
    const [modalState, setModalState] = useState<{ type: 'delete' | 'add' | 'gender'; isOpen: boolean }>({ type: 'delete', isOpen: false });
    const [newContactRole, setNewContactRole] = useState<AIRole>(AIRole.TEMAN);

    // Search
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentSearchResultIndex, setCurrentSearchResultIndex] = useState<number>(-1);

    const isNudgingRef = useRef(false);
    const userRef = useRef(user);
    const contactsRef = useRef(contacts);
    
    const isCreatorToolsChatActive = appState === 'CHAT' && activeChat.id === 'ai-creator-tools';
    const isImageGenChatActive = appState === 'CHAT' && activeChat.id === 'ai-image-creator';
    const isVideoGenChatActive = appState === 'CHAT' && activeChat.id === 'ai-video-gen';

    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { contactsRef.current = contacts; }, [contacts]);

    const availableRoles = useMemo(() => {
        const allRoles = Object.values(AIRole);
        // Fitur keamanan: Role "Secrets" hanya aktif jika user berumur 22+ DAN bio mengandung teks aktivasi.
        const canAccessSecrets = user && user.age >= 22 && user.bio?.includes('/secrets');
        
        if (canAccessSecrets) {
            return allRoles;
        }
        
        return allRoles.filter(role => role !== AIRole.SECRETS);
    }, [user]);

    // Load state from localStorage and IndexedDB on initial mount
    useEffect(() => {
        const loadState = async () => {
            const savedStateJSON = localStorage.getItem(APP_STORAGE_KEY_V3);
            if (savedStateJSON) {
                setAppState('LOADING_CHATS');
                try {
                    const savedState: SavedState = JSON.parse(savedStateJSON);
                    
                    const processAndHydrateImages = async (messages: Message[]) => {
                        for (const message of messages) {
                            if (message.imageUrl?.startsWith('indexeddb:')) {
                                const id = message.imageUrl.split(':')[1];
                                const data = await dbService.getImage(id);
                                message.imageUrl = data || undefined;
                            }
                            if (message.videoUrl?.startsWith('indexeddb:')) {
                                const id = message.videoUrl.split(':')[1];
                                const data = await dbService.getImage(id);
                                message.videoUrl = data || undefined;
                            }
                            if (message.storyboard) {
                                for(const panel of message.storyboard) {
                                    if(panel.imageUrl?.startsWith('indexeddb:')) {
                                        const id = panel.imageUrl.split(':')[1];
                                        const data = await dbService.getImage(id);
                                        panel.imageUrl = data || undefined;
                                    }
                                }
                            }
                        }
                    };

                    // Hydrate user profile pic
                    if (savedState.user.profilePicUrl?.startsWith('indexeddb:')) {
                        const id = savedState.user.profilePicUrl.split(':')[1];
                        const data = await dbService.getImage(id);
                        savedState.user.profilePicUrl = data || '';
                    }

                    // Hydrate user stories
                    if (savedState.user.stories) {
                        for (const story of savedState.user.stories) {
                            if (story.imageUrl?.startsWith('indexeddb:')) {
                                const id = story.imageUrl.split(':')[1];
                                const data = await dbService.getImage(id);
                                story.imageUrl = data || undefined;
                            }
                        }
                    }

                    // Hydrate contacts
                    for (const contact of savedState.contacts) {
                        if (contact.profilePicUrl?.startsWith('indexeddb:')) {
                            const id = contact.profilePicUrl.split(':')[1];
                            const data = await dbService.getImage(id);
                            contact.profilePicUrl = data || '';
                        }
                        await processAndHydrateImages(contact.messages);
                    }
                    
                    // Restore timestamps
                    const restoredUser = {
                        ...savedState.user,
                        stories: (savedState.user.stories || []).map(s => ({...s, timestamp: new Date(s.timestamp)})),
                    };

                    const restoredContacts = savedState.contacts.map(contact => ({
                        ...contact,
                        messages: (contact.messages || []).map(msg => ({...msg, timestamp: new Date(msg.timestamp)})),
                        role: contact.role || AIRole.TEMAN,
                    }));

                    if (savedState.imageCreatorState) {
                        await processAndHydrateImages(savedState.imageCreatorState.messages);
                        const restoredMessages = savedState.imageCreatorState.messages.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) }));
                        
                        // Reconstruct the generatedImages array from the message history to ensure it's always up-to-date
                        const restoredGeneratedImages = restoredMessages
                            .filter(msg => msg.sender === MessageSender.AI && msg.imageUrl)
                            .map(msg => msg.imageUrl!);

                        setImageCreatorState(prev => ({
                            ...prev,
                            messages: restoredMessages,
                            generatedImages: restoredGeneratedImages,
                            settings: { ...initialImageCreatorState.settings, ...savedState.imageCreatorState?.settings }
                        }));
                    }

                    if (savedState.removeBgState) {
                        await processAndHydrateImages(savedState.removeBgState.messages);
                        const restoredMessages = savedState.removeBgState.messages.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) }));
                        setRemoveBgState(prev => ({...prev, messages: restoredMessages}));
                    }
                    
                    if(savedState.creatorToolsState){
                        await processAndHydrateImages(savedState.creatorToolsState.messages);
                        const restoredMessages = savedState.creatorToolsState.messages.map(msg => ({...msg, timestamp: new Date(msg.timestamp)}));
                        setCreatorToolsState(prev => ({...prev, messages: restoredMessages, settings: savedState.creatorToolsState?.settings || initialCreatorToolsState.settings}));
                    }
                    
                    if (savedState.videoGenState) {
                        await processAndHydrateImages(savedState.videoGenState.messages);
                        const restoredMessages = savedState.videoGenState.messages.map(msg => ({...msg, timestamp: new Date(msg.timestamp)}));
                        setVideoGenState(prev => ({
                            ...prev,
                            messages: restoredMessages,
                            settings: savedState.videoGenState?.settings || initialVideoGenState.settings
                        }));
                    }
                    
                    setUser(restoredUser);
                    setContacts(restoredContacts);

                    if (savedState.activeScreen) {
                        setActiveScreen(savedState.activeScreen);
                    }

                    if (savedState.activeChat?.id && savedState.activeChat?.type) {
                        const chatExists =
                            (savedState.activeChat.type === 'contact' && restoredContacts.some(c => c.id === savedState.activeChat.id)) ||
                            (savedState.activeChat.type === 'tool' && ['ai-image-creator', 'ai-remove-background', 'ai-creator-tools', 'ai-video-gen'].includes(savedState.activeChat.id));
                        
                        if (chatExists) {
                            setActiveChat(savedState.activeChat);
                            setAppState('CHAT');
                        } else {
                            setAppState('MAIN');
                        }
                    } else {
                         setAppState('MAIN');
                    }
                   
                } catch (error) {
                    console.error("Failed to parse or hydrate state:", error);
                    localStorage.removeItem(APP_STORAGE_KEY_V3);
                    setAppState('SETUP');
                }
            } else {
                setAppState('SETUP');
            }
        };

        loadState();
    }, []);

    // Save state to localStorage and IndexedDB
    useEffect(() => {
        const saveState = async () => {
            if (user && appState !== 'SETUP' && appState !== 'LOADING_CHATS') {
                try {
                    const userToSave = JSON.parse(JSON.stringify(user));
                    const contactsToSave = JSON.parse(JSON.stringify(contacts));
                    const imageCreatorToSave = {
                        messages: JSON.parse(JSON.stringify(imageCreatorState.messages)),
                        // Do not save generatedImages here to avoid bloating localStorage. It will be reconstructed on load.
                        generatedImages: [],
                        settings: imageCreatorState.settings
                    };
                    const removeBgToSave = {
                        messages: JSON.parse(JSON.stringify(removeBgState.messages))
                    };
                    const creatorToolsToSave = {
                        messages: JSON.parse(JSON.stringify(creatorToolsState.messages)),
                        settings: creatorToolsState.settings
                    };
                    const videoGenToSave = {
                        messages: JSON.parse(JSON.stringify(videoGenState.messages)),
                        settings: videoGenState.settings,
                    };


                    const processImage = async (url: string | undefined, id: string): Promise<string | undefined> => {
                        if (url && (url.startsWith('data:image') || url.startsWith('data:video'))) {
                            await dbService.saveImage(id, url);
                            return `indexeddb:${id}`;
                        }
                        return url;
                    };
                    
                    const processMessages = async(messages: Message[]) => {
                        for (const message of messages) {
                            message.imageUrl = await processImage(message.imageUrl, `message-image-${message.id}`);
                            message.videoUrl = await processImage(message.videoUrl, `message-video-${message.id}`);
                            if (message.storyboard) {
                                for (const [index, panel] of message.storyboard.entries()) {
                                    panel.imageUrl = await processImage(panel.imageUrl, `storyboard-${message.id}-${index}`);
                                }
                            }
                        }
                    }

                    userToSave.profilePicUrl = await processImage(userToSave.profilePicUrl, 'user-profile-pic');
                    for (const story of userToSave.stories || []) {
                        story.imageUrl = await processImage(story.imageUrl, `story-${story.id}`);
                    }
                    for (const contact of contactsToSave) {
                        contact.profilePicUrl = await processImage(contact.profilePicUrl, `contact-profile-${contact.id}`);
                        await processMessages(contact.messages);
                    }
                    
                    await processMessages(imageCreatorToSave.messages);
                    await processMessages(removeBgToSave.messages);
                    await processMessages(creatorToolsToSave.messages);
                    await processMessages(videoGenToSave.messages);
                    
                    const stateToSave: SavedState = { 
                        user: userToSave, 
                        contacts: contactsToSave, 
                        imageCreatorState: imageCreatorToSave, 
                        removeBgState: removeBgToSave,
                        creatorToolsState: creatorToolsToSave,
                        videoGenState: videoGenToSave,
                        activeChat: appState === 'CHAT' ? activeChat : undefined,
                        activeScreen: activeScreen
                    };
                    localStorage.setItem(APP_STORAGE_KEY_V3, JSON.stringify(stateToSave));
                } catch (error) {
                    console.error("Failed to save state:", error);
                    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                        alert("Gagal menyimpan data. Penyimpanan perangkat mungkin penuh.");
                    }
                }
            }
        };
        saveState();
    }, [user, contacts, imageCreatorState, removeBgState, creatorToolsState, videoGenState, appState, activeChat, activeScreen]);

    const activeChatData = useMemo(() => {
        if (activeChat.type === 'contact') {
            return contacts.find(c => c.id === activeChat.id);
        }
        if (activeChat.type === 'tool') {
            if (activeChat.id === 'ai-image-creator') return imageCreatorState;
            if (activeChat.id === 'ai-remove-background') return removeBgState;
            if (activeChat.id === 'ai-creator-tools') return creatorToolsState;
            if (activeChat.id === 'ai-video-gen') return videoGenState;
        }
        return null;
    }, [activeChat, contacts, imageCreatorState, removeBgState, creatorToolsState, videoGenState]);

    const handleSetupComplete = (name: string, gender: 'male' | 'female', age: number) => {
        setUser({ name, gender, age, bio: '', profilePicUrl: '', stories: [] });
        setAppState('LOADING_CHATS');
        setTimeout(() => setAppState('MAIN'), 3000);
    };

    const handleUpdateUser = useCallback(async (updates: Partial<User>) => {
        if (updates.profilePicUrl === '') {
            await dbService.deleteImage('user-profile-pic');
        }
        setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
    }, []);

    const handleResetApp = async () => {
        await dbService.clearImages();
        localStorage.removeItem(APP_STORAGE_KEY_V3);
        setUser(null);
        setContacts([]);
        setImageCreatorState(initialImageCreatorState);
        setRemoveBgState(initialRemoveBgState);
        setCreatorToolsState(initialCreatorToolsState);
        setVideoGenState(initialVideoGenState);
        setActiveChat({ id: '', type: null });
        setModalState({ type: 'gender', isOpen: false });
        setActiveScreen('CHATS');
        setAppState('SETUP');
    };

    const handleAddContact = async () => {
        const currentUser = userRef.current;
        if (!currentUser || contactsRef.current.length >= 3) return;
        setModalState({ type: 'add', isOpen: false });
        setAppState('GENERATING_CONTACT');
        setIsLoading(true);

        const aiGender = currentUser.gender === 'male' ? AIGender.FEMALE : AIGender.MALE;
        const personas = aiGender === AIGender.MALE ? MALE_AI_PERSONAS : FEMALE_AI_PERSONAS;
        const existingNames = contactsRef.current.map(c => c.name);
        const availablePersonas = personas.filter(p => !existingNames.includes(p.name));
        
        if (availablePersonas.length === 0) {
            setAppState('MAIN');
            setIsLoading(false);
            return;
        }

        const randomPersona = availablePersonas[Math.floor(Math.random() * availablePersonas.length)];

        if (!randomPersona) {
            setAppState('MAIN');
            setIsLoading(false);
            return;
        }

        const prompt = await generateImagePrompt(randomPersona.personality, aiGender, randomPersona.name, newContactRole);
        const imageUrl = await generateAIImage(prompt, '1:1');

        let initialText: string, initialEmotion: Emotion;

        switch (newContactRole) {
            case AIRole.PACAR:
                initialText = `Haiii sayanggg ${currentUser.name} ❤️ Kenalin, aku ${randomPersona.name}. Seneng banget akhirnya bisa ngobrol sama kamu hehe.`;
                initialEmotion = Emotion.SUKA;
                break;
            case AIRole.BESTIE:
                initialText = `Woyyy, ${currentUser.name}! Kenalin, gue ${randomPersona.name}. Siap-siap ya, chat kita bakal rameee! 🥳`;
                initialEmotion = Emotion.SENANG;
                break;
            case AIRole.MUSUH:
                initialText = `Oh, jadi lo ${currentUser.name}? Gue ${randomPersona.name}. Jangan harap kita bisa akur ya.`;
                initialEmotion = Emotion.BADMOOD;
                break;
            case AIRole.SECRETS:
                initialText = `Udah siap buat 'main' sama aku, ${currentUser.name}? Aku ${randomPersona.name}, dan aku udah nungguin kamu... 😉`;
                initialEmotion = Emotion.SANGE;
                break;
            default:
                 initialText = aiGender === AIGender.MALE
                    ? `Halo ${currentUser.name}! Kenalin, gue ${randomPersona.name}. Siap jadi temen ngobrol lo nih.`
                    : `Haii ${currentUser.name}! Aku ${randomPersona.name}, temen ngobrol barumu. Seneng deh bisa kenalan sama kamu.`;
                initialEmotion = Emotion.NETRAL;
                break;
        }
        
        const initialMessage: Message = {
            id: `ai-init-${Date.now()}`, text: initialText, sender: MessageSender.AI, emotion: initialEmotion, timestamp: new Date(),
        };

        const newContact: AIContact = {
            id: `contact-${Date.now()}`, gender: aiGender, name: randomPersona.name, personality: randomPersona.personality,
            profilePicPrompt: prompt, profilePicUrl: imageUrl, messages: [initialMessage], emotion: initialEmotion,
            nudgeCount: 0, unreadCount: 1, role: newContactRole,
        };
        
        setNewContactRole(AIRole.TEMAN);
        setContacts(prev => [...prev, newContact]);
        setActiveChat({ id: newContact.id, type: 'contact' });
        setIsLoading(false);
        setAppState('CHAT');
    };

    const handlePostStory = useCallback(async (storyData: Omit<StoryItem, 'id' | 'timestamp'>) => {
        const currentUser = userRef.current;
        if (!currentUser) return;
    
        const newStory: StoryItem = { ...storyData, id: `story-${Date.now()}`, timestamp: new Date() };
        setUser(prev => prev ? { ...prev, stories: [...(prev.stories || []), newStory] } : null);
        setIsAddingStory(false);

        setContacts(prevContacts =>
            prevContacts.map(c => ({
                ...c,
                nudgeCount: 0,
            }))
        );

        setTimeout(async () => {
            const currentContacts = contactsRef.current;
            const latestUser = userRef.current;
            if (currentContacts.length === 0 || !latestUser) return;

            if (!(latestUser.stories || []).some(story => story.id === newStory.id)) {
                return; 
            }

            const randomContact = currentContacts[Math.floor(Math.random() * currentContacts.length)];
            const aiReply = await getAIStoryReply(newStory, randomContact, latestUser);
            
            if (aiReply) {
                const replyMessage: Message = {
                    id: `ai-story-reply-${Date.now()}`,
                    text: aiReply.response,
                    sender: MessageSender.AI,
                    emotion: aiReply.emotion,
                    timestamp: new Date(),
                    repliedToStory: newStory,
                };
                setContacts(prev => {
                    if (!prev.some(c => c.id === randomContact.id)) {
                        return prev; 
                    }
                    return prev.map(c => 
                        c.id === randomContact.id ? { 
                            ...c, 
                            messages: [...c.messages, replyMessage],
                            unreadCount: (c.unreadCount || 0) + 1,
                            emotion: aiReply.emotion
                        } : c
                    )
                });
            }
        }, 30 * 1000); 
    }, []);

    const handleDeleteStory = useCallback(async (storyId: string) => {
        const currentUser = userRef.current;
        if (!currentUser) return;

        const storyToDelete = (currentUser.stories || []).find(s => s.id === storyId);
        if (storyToDelete?.imageUrl) {
            await dbService.deleteImage(`story-${storyId}`);
        }

        const updatedStories = (currentUser.stories || []).filter(s => s.id !== storyId);
        setUser(prev => prev ? { ...prev, stories: updatedStories } : null);
        
        setViewingStoryGroup(prev => {
            if (!prev) return null;
            const newStories = prev.stories.filter(s => s.id !== storyId);
            if (newStories.length === 0) {
                return null;
            }
            return { ...prev, stories: newStories };
        });

    }, []);

    const handleDeleteContact = async () => {
        if (activeChat.type !== 'contact' || !activeChat.id) return;
        const contactToDelete = contacts.find(c => c.id === activeChat.id);
        if (contactToDelete) {
            await dbService.deleteImage(`contact-profile-${contactToDelete.id}`);
            for (const message of contactToDelete.messages) {
                if (message.imageUrl) {
                    await dbService.deleteImage(`message-image-${message.id}`);
                }
            }
        }
        setContacts(prev => prev.filter(c => c.id !== activeChat.id));
        setActiveChat({ id: '', type: null });
        setModalState({ type: 'delete', isOpen: false });
        setAppState('MAIN');
    };

    const handleSelectContact = (contactId: string) => {
        setContacts(prev => prev.map(c => c.id === contactId ? { ...c, unreadCount: 0 } : c));
        setActiveChat({ id: contactId, type: 'contact' });
        setAppState('CHAT');
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    const handleSelectTool = (toolId: string) => {
        setActiveChat({ id: toolId, type: 'tool' });
        setAppState('CHAT');
        setIsSearchOpen(false);
        setSearchQuery('');
    };
    
    const handleBackToMain = () => {
        setActiveChat({ id: '', type: null });
        setAppState('MAIN');
    };
    
    const handleStoryReplyClick = useCallback((story: StoryItem) => {
        const currentUser = userRef.current;
        if (!currentUser) return;
        setViewingStoryGroup({
            stories: [story],
            author: currentUser
        });
    }, []);

    const addWatermark = (base64Image: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(base64Image); // Fallback
                    return;
                }
                ctx.drawImage(img, 0, 0);
                
                // Watermark style
                ctx.font = `${Math.max(12, canvas.width * 0.02)}px Arial`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 5;
                
                ctx.fillText('arstate.ai', canvas.width - (canvas.width * 0.015), canvas.height - (canvas.width * 0.015));
                
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => {
                resolve(base64Image); // Fallback on error
            };
            img.src = base64Image;
        });
    };

    const handleSendImagePrompt = async (text: string) => {
        if (isLoading) return;

        const { settings } = imageCreatorState;
        const totalRefs = (settings.subjectRefUrls?.length || 0) + (settings.sceneryRefUrls?.length || 0) + (settings.styleRefUrls?.length || 0);

        if (settings.isConsistent && totalRefs > 3) {
            alert("Image Consistency hanya mendukung maksimal 3 gambar referensi. Harap kurangi jumlah gambar referensi atau nonaktifkan mode konsisten.");
            return;
        }
    
        const isRevision = replyingToMessage && replyingToMessage.imageUrl && replyingToMessage.imagePrompt;
    
        const userMessage: Message = {
            id: `user-img-prompt-${Date.now()}`,
            text,
            sender: MessageSender.USER,
            timestamp: new Date(),
            repliedTo: replyingToMessage ? { 
                senderName: 'Image Gen', 
                text: replyingToMessage.imageUrl ? 'Gambar' : (replyingToMessage.text || '') 
            } : undefined,
        };
        
        const originalMessageToReplyTo = replyingToMessage;
        setReplyingToMessage(null);
    
        const tempLoadingId = `ai-loading-${Date.now()}`;
        const loadingMessage: Message = {
            id: tempLoadingId,
            sender: MessageSender.AI,
            text: isRevision ? 'Revising prompt...' : 'Enchanting prompt...',
            timestamp: new Date(),
            isLoading: true,
        };
        
        setImageCreatorState(prev => ({ ...prev, messages: [...prev.messages, userMessage, loadingMessage] }));
        setIsLoading(true);
    
        try {
            if (settings.isConsistent) {
                setImageCreatorState(prev => ({ 
                    ...prev, 
                    messages: prev.messages.map(m => m.id === tempLoadingId ? { ...m, text: 'Generating consistent image...' } : m)
                }));
    
                const result = await generateConsistentImage(text, settings);
                const watermarkedImageUrl = await addWatermark(result.imageUrl);
                
                const imageMessage: Message = {
                    id: `ai-img-${Date.now()}`,
                    text: result.textResponse || '',
                    sender: MessageSender.AI,
                    timestamp: new Date(),
                    imageUrl: watermarkedImageUrl,
                    imagePrompt: text, // Use user's raw text as prompt history for this mode
                    repliedTo: {
                        senderName: user?.name || 'User',
                        text: userMessage.text
                    }
                };
    
                setImageCreatorState(prev => {
                    const newMessages = prev.messages.filter(m => m.id !== tempLoadingId);
                    newMessages.push(imageMessage);
                    return {
                        ...prev,
                        messages: newMessages,
                        generatedImages: [...prev.generatedImages, watermarkedImageUrl],
                    }
                });

            } else {
                let finalPrompt: string;
                if (isRevision && originalMessageToReplyTo?.imagePrompt) {
                    finalPrompt = await reviseImagePrompt(originalMessageToReplyTo.imagePrompt, text);
                } else {
                    finalPrompt = await developImagePrompt(text, imageCreatorState.settings);
                }

                setImageCreatorState(prev => ({ 
                    ...prev, 
                    messages: prev.messages.map(m => m.id === tempLoadingId ? { ...m, text: 'Generating image...' } : m)
                }));
                
                const imageUrl = await generateAIImage(finalPrompt, imageCreatorState.settings.aspectRatio);
                if (!imageUrl) throw new Error("Image generation failed, returned empty URL.");

                const watermarkedImageUrl = await addWatermark(imageUrl);
        
                const imageMessage: Message = {
                    id: `ai-img-${Date.now()}`,
                    text: '',
                    sender: MessageSender.AI,
                    timestamp: new Date(),
                    imageUrl: watermarkedImageUrl,
                    imagePrompt: finalPrompt,
                    repliedTo: {
                        senderName: user?.name || 'User',
                        text: userMessage.text
                    }
                };
                
                setImageCreatorState(prev => {
                    const newMessages = prev.messages.filter(m => m.id !== tempLoadingId);
                    newMessages.push(imageMessage);
                    const shouldClearRefs = !isRevision && !settings.isConsistent;

                    return {
                        ...prev,
                        messages: newMessages,
                        generatedImages: [...prev.generatedImages, watermarkedImageUrl],
                        settings: shouldClearRefs ? {
                            ...prev.settings,
                            subjectRefUrls: [],
                            sceneryRefUrls: [],
                            styleRefUrls: [],
                        } : prev.settings
                    }
                });
            }
        } catch (error) {
            console.error("Error in image generation flow:", error);
            const errorMessage: Message = {
                id: `ai-error-${Date.now()}`,
                text: "Waduh, ada masalah pas bikin gambar. Coba lagi nanti ya.",
                sender: MessageSender.AI,
                timestamp: new Date(),
                repliedTo: {
                    senderName: user?.name || 'User',
                    text: userMessage.text
                }
            };
            setImageCreatorState(prev => ({
                ...prev, 
                messages: prev.messages.filter(m => m.id !== tempLoadingId).concat(errorMessage)
            }));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRemoveBackground = async (imageDataUrl: string) => {
        setIsLoading(true);
        const userMessage: Message = {
            id: `user-rb-${Date.now()}`,
            text: '',
            imageUrl: imageDataUrl,
            sender: MessageSender.USER,
            timestamp: new Date(),
        };
        setRemoveBgState(prev => ({ ...prev, messages: [...prev.messages, userMessage] }));

        try {
            const fetchRes = await fetch(imageDataUrl);
            const imageBlob = await fetchRes.blob();

            const formData = new FormData();
            formData.append('size', 'auto');
            formData.append('image_file', imageBlob, 'source_image.png');

            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-API-Key': 'xwiaqxj5xYFUnTQKNzVh4deU',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const resultBlob = await response.blob();
            const resultDataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(resultBlob);
            });

            const aiMessage: Message = {
                id: `ai-rb-result-${Date.now()}`,
                sender: MessageSender.AI,
                text: 'Ini hasilnya!',
                imageUrl: resultDataUrl,
                timestamp: new Date(),
            };
            setRemoveBgState(prev => ({ ...prev, messages: [...prev.messages, aiMessage] }));

        } catch (error) {
            console.error("Error removing background:", error);
            const errorMessage: Message = {
                id: `ai-rb-error-${Date.now()}`,
                text: 'Maaf, ada masalah saat memproses gambarmu. Coba lagi nanti ya.',
                sender: MessageSender.AI,
                timestamp: new Date(),
            };
            setRemoveBgState(prev => ({...prev, messages: [...prev.messages, errorMessage]}));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDirectRemoveBackground = async (imageDataUrl: string) => {
        if (isLoading) return;

        setIsLoading(true);

        const tempLoadingId = `ai-loading-rb-${Date.now()}`;
        const loadingMessage: Message = {
            id: tempLoadingId,
            sender: MessageSender.AI,
            text: 'Menghapus background...',
            timestamp: new Date(),
            isLoading: true,
        };

        setImageCreatorState(prev => ({ ...prev, messages: [...prev.messages, loadingMessage] }));

        try {
            const fetchRes = await fetch(imageDataUrl);
            const imageBlob = await fetchRes.blob();

            const formData = new FormData();
            formData.append('size', 'auto');
            formData.append('image_file', imageBlob, 'source_image.png');

            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: { 'X-API-Key': 'xwiaqxj5xYFUnTQKNzVh4deU' },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const resultBlob = await response.blob();
            const resultDataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(resultBlob);
            });

            const watermarkedImageUrl = await addWatermark(resultDataUrl);

            const aiMessage: Message = {
                id: `ai-img-rb-${Date.now()}`,
                sender: MessageSender.AI,
                text: 'Ini hasilnya setelah backgroundnya dihapus!',
                imageUrl: watermarkedImageUrl,
                imagePrompt: 'background removed', // Special prompt for history
                timestamp: new Date(),
            };
            
            setImageCreatorState(prev => {
                const newMessages = prev.messages.filter(m => m.id !== tempLoadingId);
                newMessages.push(aiMessage);
                return {
                    ...prev,
                    messages: newMessages,
                    generatedImages: [...prev.generatedImages, watermarkedImageUrl],
                };
            });

        } catch (error) {
            console.error("Error removing background directly:", error);
            const errorMessage: Message = {
                id: `ai-rb-error-${Date.now()}`,
                text: 'Maaf, ada masalah saat menghapus background gambar ini. Coba lagi nanti ya.',
                sender: MessageSender.AI,
                timestamp: new Date(),
            };
            setImageCreatorState(prev => ({
                ...prev,
                messages: prev.messages.filter(m => m.id !== tempLoadingId).concat(errorMessage)
            }));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCreatorToolModeChange = (mode: CreatorToolsMode) => {
        setCreatorToolsState(prev => ({...prev, settings: {...prev.settings, mode }}));
    };

    const handleSendCreatorToolsMessage = async (text: string) => {
        if (isLoading) return;

        const userMessage: Message = {
            id: `user-ct-${Date.now()}`, text, sender: MessageSender.USER, timestamp: new Date()
        };

        const tempLoadingId = `ai-loading-${Date.now()}`;
        const loadingMessage: Message = {
            id: tempLoadingId, sender: MessageSender.AI,
            text: `Membuat ${creatorToolsState.settings.mode}...`,
            timestamp: new Date(), isLoading: true,
        };

        setCreatorToolsState(prev => ({ ...prev, messages: [...prev.messages, userMessage, loadingMessage] }));
        setIsLoading(true);

        try {
            const result = await generateCreativeContent(text, creatorToolsState.settings.mode);
            
            const aiMessage: Message = {
                id: `ai-ct-${Date.now()}`,
                text: result.textResponse,
                sender: MessageSender.AI,
                timestamp: new Date(),
                scriptTitle: result.scriptTitle,
                logline: result.logline,
                synopsis: result.synopsis,
                storyboard: result.storyboard,
                shotlist: result.shotlist,
                creatorToolMode: creatorToolsState.settings.mode,
            };

            setCreatorToolsState(prev => ({
                ...prev,
                messages: prev.messages.filter(m => m.id !== tempLoadingId).concat(aiMessage)
            }));
        } catch (error) {
             console.error("Error in creative tools flow:", error);
            const errorMessage: Message = {
                id: `ai-error-${Date.now()}`,
                text: "Waduh, ada masalah pas memproses idemu. Coba lagi nanti ya.",
                sender: MessageSender.AI,
                timestamp: new Date(),
            };
            setCreatorToolsState(prev => ({
                ...prev,
                messages: prev.messages.filter(m => m.id !== tempLoadingId).concat(errorMessage)
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendVideoPrompt = async (prompt: string) => {
        if (isLoading) return;

        const userMessage: Message = {
            id: `user-vg-${Date.now()}`,
            text: prompt,
            sender: MessageSender.USER,
            timestamp: new Date(),
        };

        const tempLoadingId = `ai-loading-${Date.now()}`;
        const loadingMessage: Message = {
            id: tempLoadingId,
            sender: MessageSender.AI,
            text: "Initializing video request...",
            timestamp: new Date(),
            isLoading: true,
        };
        
        setVideoGenState(prev => ({ ...prev, messages: [...prev.messages, userMessage, loadingMessage] }));
        setIsLoading(true);

        const onProgress = (message: string) => {
            setVideoGenState(prev => ({
                ...prev,
                messages: prev.messages.map(m => m.id === tempLoadingId ? { ...m, text: message } : m)
            }));
        };
        
        try {
            let imageParam;
            if (videoGenState.settings.imageRefUrl) {
                const mimeType = videoGenState.settings.imageRefUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
                const base64Data = videoGenState.settings.imageRefUrl.split(',')[1];
                imageParam = { imageBytes: base64Data, mimeType };
            }
            
            const videoUrl = await generateAIVideo(prompt, videoGenState.settings.orientation, videoGenState.settings.videoModel, imageParam, onProgress);
            
            const videoMessage: Message = {
                id: `ai-vid-${Date.now()}`,
                text: prompt,
                sender: MessageSender.AI,
                timestamp: new Date(),
                videoUrl,
                videoPrompt: prompt,
            };

            setVideoGenState(prev => ({
                ...prev,
                messages: prev.messages.filter(m => m.id !== tempLoadingId).concat(videoMessage),
                settings: { ...prev.settings, imageRefUrl: undefined } // Clear image ref after use
            }));
        } catch (error) {
            console.error("Error in video generation flow:", error);
            const errorMessage: Message = {
                id: `ai-error-${Date.now()}`,
                text: "Waduh, ada masalah saat membuat video. Mungkin coba prompt yang berbeda atau coba lagi nanti.",
                sender: MessageSender.AI,
                timestamp: new Date(),
            };
            setVideoGenState(prev => ({
                ...prev, 
                messages: prev.messages.filter(m => m.id !== tempLoadingId).concat(errorMessage)
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateStoryboardImage = async (messageId: string, panelIndex: number) => {
        if (isLoading) return;

        let panelToGenerate: StoryboardPanel | undefined;

        // Set loading state for the specific panel
        setCreatorToolsState(prev => {
            const newMessages = prev.messages.map(msg => {
                if (msg.id === messageId && msg.storyboard) {
                    const newStoryboard = [...msg.storyboard];
                    panelToGenerate = newStoryboard[panelIndex];
                    if (panelToGenerate) {
                        newStoryboard[panelIndex] = { ...panelToGenerate, isLoading: true };
                        return { ...msg, storyboard: newStoryboard };
                    }
                }
                return msg;
            });
            return { ...prev, messages: newMessages };
        });

        if (!panelToGenerate) return;

        setIsLoading(true);

        try {
            const imageUrl = await generateAIImage(panelToGenerate.visualDescription, '16:9');
            if (!imageUrl) throw new Error("Image generation failed.");
            
            const watermarkedImageUrl = await addWatermark(imageUrl);

            // Update the panel with the generated image
            setCreatorToolsState(prev => {
                const newMessages = prev.messages.map(msg => {
                    if (msg.id === messageId && msg.storyboard) {
                        const newStoryboard = [...msg.storyboard];
                        const panel = newStoryboard[panelIndex];
                        if (panel) {
                            newStoryboard[panelIndex] = { ...panel, imageUrl: watermarkedImageUrl, isLoading: false };
                            return { ...msg, storyboard: newStoryboard };
                        }
                    }
                    return msg;
                });
                return { ...prev, messages: newMessages };
            });

        } catch (error) {
            console.error("Error generating storyboard image:", error);
            // Revert loading state on error
            setCreatorToolsState(prev => {
                const newMessages = prev.messages.map(msg => {
                    if (msg.id === messageId && msg.storyboard) {
                        const newStoryboard = [...msg.storyboard];
                         const panel = newStoryboard[panelIndex];
                        if (panel) {
                            newStoryboard[panelIndex] = { ...panel, isLoading: false };
                            return { ...msg, storyboard: newStoryboard };
                        }
                    }
                    return msg;
                });
                return { ...prev, messages: newMessages };
            });
        } finally {
            setIsLoading(false);
        }
    };


    const handleSendMessage = async (text: string) => {
        if (activeChat.type === 'tool') {
             if (activeChat.id === 'ai-image-creator') await handleSendImagePrompt(text);
             if (activeChat.id === 'ai-creator-tools') await handleSendCreatorToolsMessage(text);
             if (activeChat.id === 'ai-video-gen') {
                await handleSendVideoPrompt(text);
                return;
            }
            return;
        }

        const currentUser = userRef.current;
        const contactData = contacts.find(c => c.id === activeChat.id);
        if (!contactData || !currentUser) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`, text, sender: MessageSender.USER, timestamp: new Date(),
            repliedTo: replyingToMessage ? { senderName: contactData.name, text: replyingToMessage.text } : undefined,
        };
        
        const newMessages = [...contactData.messages, userMessage];
        const repliedMessageForApi = replyingToMessage;
        setReplyingToMessage(null);
        setIsLoading(true);

        setContacts(prev => prev.map(c => c.id === activeChat.id ? {...c, messages: newMessages, nudgeCount: 0 } : c));

        const aiResponse = await getAIResponse(newMessages, contactData.gender, contactData.name, currentUser, repliedMessageForApi, contactData.personality, contactData.role);

        const aiTextMessage: Message = {
            id: `ai-text-${Date.now()}`, text: aiResponse.textResponse, sender: MessageSender.AI,
            emotion: aiResponse.emotion, timestamp: new Date(),
            repliedTo: repliedMessageForApi ? { senderName: currentUser.name, text: userMessage.text } : undefined,
        };
        
        let finalMessages = [...newMessages, aiTextMessage];

        if (aiResponse.action === 'GENERATE_AND_SEND_PHOTO' && aiResponse.sceneDescription) {
            let promptForImage: string;
            let imageAspectRatio: AspectRatio;

            // For female "Secrets" role, use the original profile prompt without modification.
            if (contactData.role === AIRole.SECRETS && contactData.gender === AIGender.FEMALE) {
                promptForImage = contactData.profilePicPrompt;
                 const aspectRatios: AspectRatio[] = ['1:1', '16:9'];
                 imageAspectRatio = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
            } else if (contactData.role === AIRole.SECRETS) { // Male "Secrets" role
                 promptForImage = await generateModifiedImagePrompt(contactData.profilePicPrompt, aiResponse.sceneDescription);
                 const aspectRatios: AspectRatio[] = ['1:1', '16:9'];
                 imageAspectRatio = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
            } else {
                // For all other roles, modify the prompt based on the scene.
                promptForImage = await generateModifiedImagePrompt(contactData.profilePicPrompt, aiResponse.sceneDescription);
                // For other roles, use a wider variety of aspect ratios.
                const aspectRatios: AspectRatio[] = ['3:4', '4:3', '16:9', '9:16'];
                imageAspectRatio = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
            }
            
            const imageUrl = await generateAIImage(promptForImage, imageAspectRatio);
            
            if (imageUrl) {
                const imageMessage: Message = {
                    id: `ai-img-${Date.now()}`,
                    text: '',
                    sender: MessageSender.AI,
                    timestamp: new Date(),
                    emotion: aiResponse.emotion,
                    imageUrl,
                    imagePrompt: promptForImage,
                };
                finalMessages.push(imageMessage);
            }
        }
        
        setIsLoading(false);
        setContacts(prev => prev.map(c => c.id === activeChat.id ? {
            ...c, messages: finalMessages, emotion: aiResponse.emotion, nudgeCount: 0 
        } : c));
    };
    
    const searchResults = useMemo(() => {
        if (!searchQuery.trim() || !activeChatData) return [];
        return activeChatData.messages
            .filter(msg => msg.text && msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(msg => msg.id);
    }, [activeChatData, searchQuery]);

    useEffect(() => {
        setCurrentSearchResultIndex(searchQuery.trim() ? (searchResults.length > 0 ? 0 : -1) : -1);
    }, [searchQuery, searchResults]);

    useEffect(() => {
        if (currentSearchResultIndex > -1 && searchResults[currentSearchResultIndex]) {
            document.getElementById(`message-${searchResults[currentSearchResultIndex]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentSearchResultIndex, searchResults]);
    
    const sendNudgeMessage = useCallback(async (contact: AIContact) => {
        const currentUser = userRef.current;
        if (isNudgingRef.current || !currentUser) return;
        isNudgingRef.current = true;
        try {
            const nudgeResponse = await getAINudgeResponse(contact.gender, contact.name, currentUser, contact.nudgeCount, contact.personality, contact.role);
            if (nudgeResponse) {
                const nudgeMessage: Message = {
                    id: `ai-nudge-${Date.now()}`, text: nudgeResponse.response, sender: MessageSender.AI,
                    emotion: nudgeResponse.emotion, timestamp: new Date(),
                };
                setContacts(prev => prev.map(c => c.id === contact.id ? { 
                    ...c, messages: [...c.messages, nudgeMessage], emotion: nudgeResponse.emotion,
                    nudgeCount: c.nudgeCount + 1, unreadCount: (c.unreadCount || 0) + 1,
                } : c));
            }
        } finally { isNudgingRef.current = false; }
    }, []);

    useEffect(() => {
        const NUDGE_INTERVALS_MS = [2 * 60 * 1000, 1 * 60 * 1000, 7 * 60 * 1000];
        const nudgeTimer = setInterval(() => {
            const now = Date.now();
            if (!userRef.current || isLoading || isNudgingRef.current) return;
            contactsRef.current.forEach(contact => {
                if (contact.role === AIRole.MUSUH || contact.nudgeCount >= 3) return;
                const lastMessage = contact.messages[contact.messages.length - 1];
                if (!lastMessage || lastMessage.sender === MessageSender.USER) return;
                if (now - new Date(lastMessage.timestamp).getTime() > NUDGE_INTERVALS_MS[contact.nudgeCount]) {
                    sendNudgeMessage(contact);
                }
            });
        }, 15 * 1000);
        return () => clearInterval(nudgeTimer);
    }, [isLoading, sendNudgeMessage]);

    const handleSetReplyingTo = (message: Message) => setReplyingToMessage(message);
    const handleImageClick = (imageUrl: string) => { setPreviewImageUrl(imageUrl); setIsImageModalOpen(true); };
    const handleClearReply = () => setReplyingToMessage(null);
    const handleToggleSearch = () => setIsSearchOpen(prev => !prev);
    const handleGoToNextResult = () => setCurrentSearchResultIndex(prev => (prev + 1) % searchResults.length);
    const handleGoToPrevResult = () => setCurrentSearchResultIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    
    const handleSettingsChange = (newSettings: Partial<ImageSettings>) => {
        setImageCreatorState(prev => {
            const updatedSettings = { ...prev.settings, ...newSettings };

            // When consistency mode is on, ensure aspect ratio is supported.
            // If the user turns it on while having an unsupported ratio (e.g. 1:1),
            // default it to a supported one.
            if (updatedSettings.isConsistent) {
                 const supportedRatios: AspectRatio[] = ['3:4', '16:9', '9:16'];
                 if (!supportedRatios.includes(updatedSettings.aspectRatio)) {
                    updatedSettings.aspectRatio = '3:4';
                 }
            }

            return { ...prev, settings: updatedSettings };
        });
    };

    const handleAvatarClick = () => {
        if (activeChat.type === 'contact' && activeChatData) {
            handleImageClick((activeChatData as AIContact).profilePicUrl);
        } else if (activeChat.id === 'ai-image-creator') {
            setIsToolProfileOpen(true);
        } else if (activeChat.id === 'ai-remove-background') {
            setIsRemoveBgProfileOpen(true);
        } else if (activeChat.id === 'ai-video-gen') {
            setIsVideGenProfileOpen(true);
        }
    };
    
    const handleDownloadScript = (message: Message) => {
        if (!user) return;
        downloadScriptAsPDF(
            message.text, 
            message.scriptTitle || 'Untitled Script', 
            user.name,
            message.logline,
            message.synopsis,
            `script-${Date.now()}.pdf`
        );
    };

    const handleEditScript = (message: Message) => {
        if (!user) return;
        setEditingScript({ 
            messageId: message.id, 
            text: message.text, 
            title: message.scriptTitle || 'Untitled Script',
            author: user.name,
            logline: message.logline || '',
            synopsis: message.synopsis || '',
        });
    };

    const handleSaveScript = (messageId: string, updates: { title: string; author: string; logline: string; synopsis: string; text: string }) => {
        if (user && user.name !== updates.author) {
            handleUpdateUser({ name: updates.author });
        }
    
        setCreatorToolsState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
                msg.id === messageId ? { 
                    ...msg, 
                    text: updates.text, 
                    scriptTitle: updates.title, 
                    logline: updates.logline, 
                    synopsis: updates.synopsis 
                } : msg
            )
        }));
        // Update the state for the editor if it's still open
        setEditingScript(prev => prev ? { ...prev, ...updates } : null);
    };
    
    const handleGenerateShotlistFromScript = async (scriptText: string) => {
        if (isLoading) return;
    
        const tempLoadingId = `ai-loading-${Date.now()}`;
        const loadingMessage: Message = {
            id: tempLoadingId, sender: MessageSender.AI,
            text: `Membuat shotlist...`,
            timestamp: new Date(), isLoading: true,
        };
    
        setCreatorToolsState(prev => ({ ...prev, messages: [...prev.messages, loadingMessage] }));
        setIsLoading(true);
    
        try {
            const result = await generateCreativeContent(scriptText, CreatorToolsMode.SHOTLIST);
            
            const aiMessage: Message = {
                id: `ai-ct-${Date.now()}`,
                text: result.textResponse,
                sender: MessageSender.AI,
                timestamp: new Date(),
                shotlist: result.shotlist,
                creatorToolMode: CreatorToolsMode.SHOTLIST,
            };
    
            setCreatorToolsState(prev => ({
                ...prev,
                messages: prev.messages.filter(m => m.id !== tempLoadingId).concat(aiMessage),
                settings: { ...prev.settings, mode: CreatorToolsMode.SHOTLIST }
            }));
        } catch (error) {
            console.error("Error generating shotlist from script:", error);
            const errorMessage: Message = {
                id: `ai-error-${Date.now()}`,
                text: "Waduh, ada masalah pas membuat shotlist dari script ini. Coba lagi nanti ya.",
                sender: MessageSender.AI,
                timestamp: new Date(),
            };
            setCreatorToolsState(prev => ({
                ...prev,
                messages: prev.messages.filter(m => m.id !== tempLoadingId).concat(errorMessage)
            }));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEditShotlist = (message: Message) => {
        if (message.shotlist) {
            setEditingShotlist({
                ...message.shotlist,
                messageId: message.id,
            });
        }
    };

    const handleSaveShotlist = (messageId: string, updatedShotlist: Shotlist) => {
        setCreatorToolsState(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
                msg.id === messageId ? { ...msg, shotlist: updatedShotlist } : msg
            )
        }));
        setEditingShotlist(null);
    };

    const handleDownloadShotlist = (message: Message) => {
        if (message.shotlist && user) {
            downloadShotlistAsPDF(
                message.shotlist,
                user.name,
                `shotlist-${Date.now()}.pdf`
            );
        }
    };


    const renderPage = () => {
        const pageClasses = "absolute inset-0 transition-opacity duration-500 ease-in-out";
        const screenContainerClasses = "absolute inset-0 h-full w-full flex transition-transform duration-300 ease-in-out";
        let transformStyle = {};
        if (appState === 'MAIN') {
            switch(activeScreen) {
                case 'TOOLS': transformStyle = {transform: `translateX(0%)`}; break;
                case 'CHATS': transformStyle = {transform: `translateX(-100%)`}; break;
                case 'STORY': transformStyle = {transform: `translateX(-200%)`}; break;
                case 'PROFILE': transformStyle = {transform: `translateX(-300%)`}; break;
            }
        }

        const isImageCreator = activeChat.id === 'ai-image-creator';
        const isCreatorTools = activeChat.id === 'ai-creator-tools';
        const isRemoveBg = activeChat.id === 'ai-remove-background';
        const isVideoGen = activeChat.id === 'ai-video-gen';

        return (
            <>
                 <div className={`${pageClasses} ${appState === 'SETUP' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <SetupScreen onComplete={handleSetupComplete} />
                </div>
                <div className={`${pageClasses} ${appState === 'LOADING_CHATS' || appState === 'GENERATING_CONTACT' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                   <LoadingScreen 
                        title={appState === 'LOADING_CHATS' ? 'Memuat Data...' : `Menghubungi teman baru...`}
                        subtitle={appState === 'LOADING_CHATS' ? 'Menyiapkan pengalaman ngobrolmu.' : 'Mohon tunggu sebentar ya.'}
                    />
                </div>
                 <div className={`${pageClasses} ${appState === 'MAIN' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                     {user && (
                        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 relative">
                             <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 shrink-0">
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
                                    {activeScreen === 'TOOLS' ? 'AI Tools' : activeScreen.toLowerCase()}
                                </h1>
                            </header>

                            <div className="flex-1 relative overflow-hidden">
                                <div className={screenContainerClasses} style={transformStyle}>
                                    <div className="w-full shrink-0 h-full"><AIToolsScreen onSelectTool={handleSelectTool} /></div>
                                    <div className="w-full shrink-0 h-full"><ChatsListScreen contacts={contacts} onSelectContact={handleSelectContact}/></div>
                                    <div className="w-full shrink-0 h-full"><StoryScreen user={user} onAddStory={() => setIsAddingStory(true)} onViewStory={() => setViewingStoryGroup({ stories: user.stories || [], author: user})}/></div>
                                    <div className="w-full shrink-0 h-full"><ProfileScreen user={user} onUpdateUser={handleUpdateUser} onGenderChangeAttempt={() => setModalState({type: 'gender', isOpen: true})} onOpenProfilePicModal={() => setIsProfilePicModalOpen(true)}/></div>
                                </div>
                            </div>
                            
                            <footer className="p-2 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shrink-0">
                                <div className="flex justify-around items-center">
                                     <button onClick={() => setActiveScreen('TOOLS')} className={`flex flex-col items-center transition-colors px-4 py-1 rounded-lg ${activeScreen === 'TOOLS' ? 'text-blue-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                                        <ToolsIcon className="w-7 h-7" /> <span className="text-xs mt-1">Tools</span>
                                    </button>
                                     <button onClick={() => setActiveScreen('CHATS')} className={`flex flex-col items-center transition-colors px-4 py-1 rounded-lg ${activeScreen === 'CHATS' ? 'text-blue-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                                        <ChatIcon className="w-7 h-7" /> <span className="text-xs mt-1">Chats</span>
                                    </button>
                                    <button onClick={() => setActiveScreen('STORY')} className={`flex flex-col items-center transition-colors px-4 py-1 rounded-lg ${activeScreen === 'STORY' ? 'text-blue-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                                        <StoryIcon className="w-7 h-7" /> <span className="text-xs mt-1">Story</span>
                                    </button>
                                    <button onClick={() => setActiveScreen('PROFILE')} className={`flex flex-col items-center transition-colors px-4 py-1 rounded-lg ${activeScreen === 'PROFILE' ? 'text-blue-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                                        <UserIcon className="w-7 h-7" /> <span className="text-xs mt-1">Profil</span>
                                    </button>
                                </div>
                            </footer>
                             {activeScreen === 'CHATS' && (
                                <button
                                    onClick={() => setModalState({ type: 'add', isOpen: true })}
                                    disabled={contacts.length >= 3}
                                    className="absolute bottom-24 right-6 w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none z-20"
                                    aria-label="Tambah AI baru"
                                >
                                <AddIcon className="w-8 h-8" />
                                </button>
                            )}
                             {activeScreen === 'STORY' && (
                                <button
                                    onClick={() => setIsAddingStory(true)}
                                    className="absolute bottom-24 right-6 w-16 h-16 bg-yellow-500 text-white rounded-full shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-yellow-500 z-20"
                                    aria-label="Tambah Story Baru"
                                >
                                <AddIcon className="w-8 h-8" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                 <div className={`${pageClasses} flex flex-col ${appState === 'CHAT' && activeChatData ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                     {appState === 'CHAT' && activeChatData && (
                        <>
                            <Header 
                                onBack={handleBackToMain}
                                emotion={(activeChatData as AIContact)?.emotion} 
                                aiName={activeChatData.name} 
                                subtitle={isImageCreator || isVideoGen ? 'Klik profile untuk melihat riwayat!' : undefined}
                                aiProfilePicUrl={activeChatData.profilePicUrl}
                                onAvatarClick={handleAvatarClick}
                                onDeleteContactClick={activeChat.type === 'contact' ? () => setModalState({ type: 'delete', isOpen: true }) : undefined}
                                isSearchOpen={isSearchOpen} onSearchToggle={handleToggleSearch} searchQuery={searchQuery}
                                onSearchQueryChange={setSearchQuery} searchResultCount={searchResults.length}
                                currentSearchResultIndex={currentSearchResultIndex} onGoToNextResult={handleGoToNextResult}
                                onGoToPrevResult={handleGoToPrevResult}
                                onSettingsClick={isImageCreator ? () => setIsToolSettingsOpen(prev => !prev) : undefined}
                                creatorToolMode={isCreatorTools ? creatorToolsState.settings.mode : undefined}
                                onCreatorToolModeChange={isCreatorTools ? handleCreatorToolModeChange : undefined}
                            />
                            <MessageList 
                                messages={activeChatData.messages} 
                                isLoading={isLoading && !activeChatData.messages.some(m => m.isLoading)} 
                                onReply={handleSetReplyingTo}
                                backgroundColorClass={emotionBackgroundColors[(activeChatData as AIContact)?.emotion] || emotionBackgroundColors[Emotion.NETRAL]}
                                onImageClick={handleImageClick} 
                                searchQuery={searchQuery}
                                highlightedMessageId={currentSearchResultIndex > -1 ? searchResults[currentSearchResultIndex] : null}
                                onStoryReplyClick={handleStoryReplyClick}
                                isImageCreatorChat={isImageCreator}
                                isRemoveBgChat={isRemoveBg}
                                isVideoGenChat={isVideoGen}
                                onRemoveBackgroundClick={handleDirectRemoveBackground}
                                onGenerateStoryboardImage={handleGenerateStoryboardImage}
                                onDownloadScript={handleDownloadScript}
                                onEditScript={handleEditScript}
                                onGenerateShotlistFromScript={handleGenerateShotlistFromScript}
                                onDownloadShotlist={handleDownloadShotlist}
                                onEditShotlist={handleEditShotlist}
                            />
                            {isVideoGen ? (
                                <VideoChatInput
                                    onSendMessage={handleSendMessage}
                                    isLoading={isLoading}
                                    settings={videoGenState.settings}
                                    onSettingsChange={(newSettings) => setVideoGenState(p => ({...p, settings: {...p.settings, ...newSettings}}))}
                                />
                            ) : isRemoveBg ? (
                                <ImageUploadInput onSendImage={handleRemoveBackground} isLoading={isLoading} />
                            ) : (
                                <ChatInput 
                                    onSendMessage={handleSendMessage} 
                                    isLoading={isLoading} 
                                    replyingToMessage={replyingToMessage} 
                                    onClearReply={handleClearReply}
                                    formContainerClassName={isCreatorTools || isImageGenChatActive ? "md:max-w-6xl md:mx-auto" : ""}
                                    placeholder={isCreatorTools ? "Tulis ide naskah, adegan, atau ceritamu... (Shift + Enter untuk baris baru)" : "Ketik pesan lo di sini..."}
                                />
                            )}
                        </>
                     )}
                </div>
            </>
        )
    };

    return (
        <div className="h-screen w-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center font-sans">
            <div className={`w-full bg-gray-50 dark:bg-gray-800 overflow-hidden relative transition-all duration-500 ease-in-out ${
                isCreatorToolsChatActive || isVideoGenChatActive || isImageGenChatActive
                    ? 'h-screen max-w-full'
                    : 'max-w-2xl h-full md:h-[95vh] md:max-h-[800px] shadow-2xl rounded-none md:rounded-2xl'
            }`}>
                {renderPage()}
            </div>

            {isToolProfileOpen && (
                <ImageCreatorProfile
                    name={imageCreatorState.name}
                    profilePicUrl={imageCreatorState.profilePicUrl}
                    messages={imageCreatorState.messages}
                    onClose={() => setIsToolProfileOpen(false)}
                    onImageClick={handleImageClick}
                />
            )}
            
            {isRemoveBgProfileOpen && (
                <RemoveBgProfile
                    name={removeBgState.name}
                    profilePicUrl={removeBgState.profilePicUrl}
                    messages={removeBgState.messages}
                    onClose={() => setIsRemoveBgProfileOpen(false)}
                    onImageClick={handleImageClick}
                />
            )}
            
            {isVideGenProfileOpen && (
                <VideoGenProfile
                    name={videoGenState.name}
                    profilePicUrl={videoGenState.profilePicUrl}
                    messages={videoGenState.messages}
                    onClose={() => setIsVideGenProfileOpen(false)}
                />
            )}

            {isImageModalOpen && <ImagePreviewModal imageUrl={previewImageUrl} onClose={() => setIsImageModalOpen(false)} />}
            {user && isProfilePicModalOpen && (
                <UserProfilePicModal 
                    imageUrl={user.profilePicUrl} onClose={() => setIsProfilePicModalOpen(false)}
                    onUpdateImage={(dataUrl) => handleUpdateUser({ profilePicUrl: dataUrl })}
                    onDeleteImage={() => handleUpdateUser({ profilePicUrl: '' })}
                />
            )}
            {isAddingStory && <AddStoryScreen onClose={() => setIsAddingStory(false)} onPost={handlePostStory} />}
            {viewingStoryGroup && (
                <StoryViewer 
                    storyGroup={viewingStoryGroup} 
                    onClose={() => setViewingStoryGroup(null)} 
                    onDeleteStory={handleDeleteStory}
                />
            )}
             {isToolSettingsOpen && (
                <ImageSettingsPopover
                    settings={imageCreatorState.settings}
                    onChange={handleSettingsChange}
                    onClose={() => setIsToolSettingsOpen(false)}
                />
            )}
             {editingScript && user && (
                <ScriptEditor
                    script={{...editingScript, author: user.name}}
                    onClose={() => setEditingScript(null)}
                    onSave={handleSaveScript}
                />
            )}
            
            {editingShotlist && user && (
                <ShotlistEditor
                    shotlist={{ ...editingShotlist, director: user.name }}
                    onClose={() => setEditingShotlist(null)}
                    onSave={handleSaveShotlist}
                />
            )}
            
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={
                    modalState.type === 'delete' ? handleDeleteContact :
                    modalState.type === 'add' ? handleAddContact :
                    handleResetApp
                }
                title={
                    modalState.type === 'delete' ? 'Hapus Kontak?' :
                    modalState.type === 'add' ? 'Tambah Teman Baru?' : 'Ganti Gender?'
                }
                message={
                    modalState.type === 'delete' ? `Kamu yakin mau menghapus ${(activeChatData as AIContact)?.name}? Semua riwayat chat akan hilang.`
                    : modalState.type === 'add' ? `Kamu akan membuat teman AI baru. Kamu hanya bisa memiliki maksimal 3 teman.`
                    : 'Mengubah gender akan menghapus SEMUA kontak dan riwayat chat. Aplikasi akan dimulai dari awal. Yakin mau lanjut?'
                }
                confirmText={
                    modalState.type === 'delete' ? 'Hapus' :
                    modalState.type === 'add' ? 'Ya, Tambahkan' : 'Ya, Reset Aplikasi'
                }
                confirmButtonClass={
                    modalState.type === 'delete' || modalState.type === 'gender' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                }
            >
                {modalState.type === 'add' && (
                    <div className="w-full">
                        <label htmlFor="role-select" className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Pilih Role AI:</label>
                        <select
                            id="role-select" value={newContactRole}
                            onChange={(e) => setNewContactRole(e.target.value as AIRole)}
                            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all capitalize"
                        >
                            {availableRoles.map(role => (<option key={role} value={role} className="capitalize">{role}</option>))}
                        </select>
                    </div>
                )}
            </ConfirmationModal>
        </div>
    );
};
