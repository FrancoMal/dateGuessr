export interface GameRecord {
  id: number;
  date: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
  timestamp: Date;
}
