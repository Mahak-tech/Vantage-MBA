export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  icon?: string;
  color?: string;
  semester?: string;
  creditHours?: number;
  docCount?: number;
  notesCount?: number;
  cardsCount?: number;
  quizCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentPage {
  index: number;
  title: string;
  text: string;
}

export interface StudyDocument {
  id: string;
  subjectId: string;
  title: string;
  fileName: string;
  originalName: string;
  fileType: 'pdf' | 'pptx' | 'ppt' | 'docx' | 'doc' | 'txt' | string;
  fileSize: number;
  uploadDate: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string | null;
  extractedText?: string;
  pageCount: number;
  pages?: DocumentPage[];
  summary?: string;
  module?: string;
}

export type NoteType = 'complete' | 'short' | 'revision' | 'exam_oriented';

export interface Note {
  id: string;
  subjectId: string;
  sourceDocIds?: string[];
  title: string;
  type: NoteType;
  topic?: string;
  content: string;
  tags?: string[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Flashcard {
  id: string;
  subjectId: string;
  topic?: string;
  deckTitle?: string;
  front: string;
  back: string;
  sourceDocId?: string;
  status: 'unlearned' | 'learning' | 'mastered';
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string;
  lastReviewedAt?: string | null;
  createdAt?: string;
}

export type QuestionType = 'mcq' | 'true_false' | 'fill_in_the_blank' | 'short_answer' | 'case_based' | 'application_based' | 'numerical';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Question {
  id: string;
  subjectId: string;
  topic: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  wrongOptionsExplanation?: Record<string, string>;
  sourceRef?: string;
  saved?: boolean;
  createdAt?: string;
}

export interface QuizAttempt {
  id: string;
  subjectId: string;
  title: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  score: number;
  percentage: number;
  timeTakenSeconds: number;
  difficulty?: string;
  topicBreakdown?: Array<{ topic: string; total: number; correct: number; percentage: number }>;
  recommendations?: string[];
  questions?: Question[];
  userAnswers?: Record<number, string>;
  completedAt: string;
}

export interface TutorCitation {
  docId: string;
  docTitle: string;
  pageIndex: number;
  pageTitle: string;
  snippet: string;
}

export interface TutorMessage {
  id: string;
  subjectId: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: TutorCitation[];
  timestamp: string;
}

export type VisualMode = 'flowchart' | 'concept_map' | 'diagram' | 'animated_explanation' | 'simulation' | 'comparison' | 'storytelling';

export interface VisualStudioItem {
  id: string;
  subjectId: string;
  title: string;
  topic: string;
  mode: VisualMode;
  data: any;
  explanation?: string;
  sourceDocId?: string;
  createdAt: string;
}

export type TaskType = 'exam' | 'assignment' | 'presentation' | 'project' | 'study_session';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface AcademicTask {
  id: string;
  subjectId?: string | null;
  title: string;
  type: TaskType;
  dueDate: string;
  reminderDate?: string | null;
  completed: boolean;
  notes?: string;
  priority: TaskPriority;
  createdAt?: string;
}

export interface RevisionItem {
  id: string;
  subjectId: string;
  topic: string;
  reason: string;
  difficulty: 'low' | 'medium' | 'high';
  missCount: number;
  scheduledDate: string;
  lastMissedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  specialization: string;
  avatar: string;
  studyStreak: number;
  todayStudyMinutes: number;
  dailyGoalMinutes: number;
  joinedDate?: string;
}

export type AppTheme = 'sakura' | 'lavender' | 'matcha' | 'midnight';

export interface Settings {
  geminiApiKey: string;
  geminiApiKeyMasked?: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  preferredModel: string;
  dailyGoalMinutes: number;
  theme?: AppTheme;
}

// Sakura Academia Gamification & Study Garden Types
export interface GardenPlot {
  id: string;
  name: string;
  type: 'flower' | 'herb' | 'tree';
  plantName: string;
  stage: 'seedling' | 'sprout' | 'bud' | 'blooming' | 'tree' | 'locked';
  progress: number;
  requirement: string;
}

export interface GardenHistoryItem {
  id: string;
  action: string;
  points: number;
  timestamp: string;
}

export interface GardenData {
  growthPoints: number;
  level: number;
  waterDrops: number;
  plots: GardenPlot[];
  history: GardenHistoryItem[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  subtitle: string;
  category: 'academic' | 'synthesis' | 'retention' | 'mastery' | 'consistency' | 'focus' | 'garden';
  icon: string;
  color: string;
  unlocked: boolean;
  progress: number;
  reward: string;
}

export interface AchievementsData {
  badges: AchievementBadge[];
  totalUnlocked: number;
  totalBadges: number;
}

export interface FocusSession {
  id: string;
  subjectId?: string | null;
  subjectName?: string;
  durationMinutes: number;
  goal: string;
  ambientSound: string;
  completedAt: string;
}

export interface WeeklyStatItem {
  day: string;
  minutes: number;
  label: string;
}
