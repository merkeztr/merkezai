// Fix: Provide type definitions for Message and Role.
export enum Role {
  User = 'user',
  Model = 'model',
}

export interface Message {
  role: Role;
  content: string;
  image?: {
    data: string; // base64 string
    mimeType: string;
  };
}

export interface Settings {
  recognitionLanguage: string;
  enableTTS: boolean;
  ttsVoice: string;
  enableHotword: boolean;
}