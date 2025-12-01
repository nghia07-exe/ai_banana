export interface GeneratedImage {
  id: string;
  dataUrl: string; // base64
  prompt: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface AppState {
  hasApiKey: boolean;
  theme: string;
  childName: string;
  imageSize: ImageSize;
  isGenerating: boolean;
  progress: number; // 0 to 100
  generatedImages: GeneratedImage[];
  error: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
