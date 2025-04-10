export interface Video {
  id: string;
  title: string;
  type: string;
  youtubeUrl: string;
  notesUrl: string;
  codingQuestionUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  starred?: boolean;
}

export interface CoursesData {
  courses: Course[];
}

export interface VideoData {
  courseId: string;
  videos: Video[];
}

export interface AnnouncementItem {
  id: string;
  type: 'quote' | 'announcement';
  content: string;
  author?: string;
  isActive: boolean;
}

export interface AnnouncementsData {
  items: AnnouncementItem[];
}

// Auth Types
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: any;
  };
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, options?: { full_name?: string }) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<{ error: any | null }>;
}