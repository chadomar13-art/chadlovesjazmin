export type Stage = 'hero' | 'quiz' | 'animation1' | 'animation2';

export interface QuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  options: {
    text: string;
    reaction: string;
    isCorrect?: boolean;
  }[];
}

export interface AppConfig {
  partnerName: string;
  senderName: string;
  anniversaryDate: string;
  customMessage: string;
  heroImageUrl?: string;
}
