

export enum Emotion {
  SENANG = 'senang',
  SEDIH = 'sedih',
  MARAH = 'marah',
  BADMOOD = 'badmood',
  SUKA = 'suka',
  NETRAL = 'netral',
  SANGE = 'sange',
}

export enum MessageSender {
  AI = 'ai',
  USER = 'user',
}

export enum AIGender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum AIRole {
    PACAR = 'pacar',
    BESTIE = 'bestie',
    TEMAN = 'teman',
    MUSUH = 'musuh',
    SECRETS = 'secrets',
}

export enum CreatorToolsMode {
    SCRIPT = 'script',
    STORYBOARD = 'storyboard',
    SHOTLIST = 'shotlist',
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
export type CameraAngle = 'default' | 'Eye-Level' | 'Low-Angle' | 'High-Angle' | 'POV';
export type ShotType = 'default' | 'Wide' | 'Medium' | 'Close-Up' | 'Extreme Close-Up' | 'Fish-Eye';
export type ImageStyle = 'default' | 'Photorealism' | 'Anime-Ghibli-Inspired' | 'Cartoon' | 'Digital Painting' | 'Fantasy-Art' | 'Cyberpunk' | 'Pixel-Art';

export type VideoOrientation = 'landscape' | 'portrait' | 'square';

export interface VideoGenSettings {
    orientation: VideoOrientation;
    videoModel: 'veo-2' | 'veo-3';
    imageRefUrl?: string;
}

export interface ImageSettings {
    quality: 'imagen-3' | 'imagen-4';
    isConsistent: boolean;
    style: ImageStyle;
    aspectRatio: AspectRatio;
    cameraAngle: CameraAngle;
    shotType: ShotType;
    subjectRefUrls?: string[];
    sceneryRefUrls?: string[];
    styleRefUrls?: string[];
}

export interface AIPersonality {
  hobi: string;
  makanan: string;
  minuman: string;
  film: string;
}

export interface AIPersona {
  name: string;
  personality: AIPersonality;
}

export interface StoryboardPanel {
    scene: number;
    visualDescription: string;
    cameraNotes: string;
    actionNotes: string;
    imageUrl?: string;
    isLoading?: boolean;
}

export interface ShotlistItem {
    sceneShot: string;
    shotSize: string;
    movement: string;
    gear: string;
    location: string;
    extInt: 'EXT' | 'INT';
    notes: string;
    preferred: boolean;
    duration: string;
    sound: boolean;
}

export interface Shotlist {
    productionTitle: string;
    director: string;
    locations: string;
    items: ShotlistItem[];
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  emotion?: Emotion;
  repliedTo?: {
    senderName: string;
    text: string;
  };
  imageUrl?: string;
  imagePrompt?: string;
  videoUrl?: string;
  videoPrompt?: string;
  repliedToStory?: StoryItem;
  isLoading?: boolean;
  storyboard?: StoryboardPanel[];
  shotlist?: Shotlist;
  creatorToolMode?: CreatorToolsMode;
  scriptTitle?: string;
  logline?: string;
  synopsis?: string;
}

export interface StoryItem {
    id: string;
    type: 'text' | 'image';
    content: string; // Text content or image caption
    imageUrl?: string; // For image stories
    backgroundColor?: string; // For text stories
    timestamp: Date;
}

export interface User {
    name: string;
    gender: 'male' | 'female';
    age: number;
    bio?: string;
    profilePicUrl?: string;
    stories?: StoryItem[];
}

export interface AIContact {
    id: string;
    gender: AIGender;
    name: string;
    personality: AIPersonality;
    profilePicUrl: string;
    profilePicPrompt: string;
    messages: Message[];
    emotion: Emotion;
    nudgeCount: number;
    unreadCount: number;
    role: AIRole;
}