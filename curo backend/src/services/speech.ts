import { Language } from '../types';

export interface SpeechRecognitionResultCallback {
  (transcript: string, isFinal: boolean): void;
}

export interface SpeechErrorCallback {
  (error: string): void;
}

// Check for Web Speech API
const SpeechRecognition =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export class VoiceService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguage: Language = 'en';

  constructor() {
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      } catch (e) {
        console.warn('SpeechRecognition initialization warning:', e);
      }
    }
  }

  public isSupported(): boolean {
    return !!SpeechRecognition;
  }

  public getLocale(lang: Language): string {
    switch (lang) {
      case 'te':
        return 'te-IN';
      case 'hi':
        return 'hi-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  }

  public startListening(
    lang: Language,
    onResult: SpeechRecognitionResultCallback,
    onError: SpeechErrorCallback,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser environment.');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.currentLanguage = lang;
    this.recognition.lang = this.getLocale(lang);

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || 'Speech recognition encountered an error.');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      this.isListening = false;
      onError(err.message || 'Could not start microphone');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition', e);
      }
      this.isListening = false;
    }
  }

  public speak(text: string, lang: Language): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any active speech

    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = this.getLocale(lang);
    utterance.rate = 0.95; // slightly slower for clear comprehension in rural dialects
    utterance.pitch = 1.0;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const targetLangCode = this.getLocale(lang).toLowerCase();
    const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLangCode.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceService = new VoiceService();
