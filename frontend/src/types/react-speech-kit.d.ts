declare module 'react-speech-kit' {
  interface SpeechSynthesisOptions {
    text: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
  }

  export function useSpeechSynthesis(): {
    speak: (options: SpeechSynthesisOptions) => void;
    speaking: boolean;
    supported: boolean;
  };
} 