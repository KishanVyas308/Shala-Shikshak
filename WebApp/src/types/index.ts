export interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Standard {
  id: string;
  name: string;
  description?: string;
  order: number;
  subjects?: Subject[];
  _count?: {
    subjects: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  order: number;
  standardId: string;
  standard?: {
    id: string;
    name: string;
  };
  chapters?: Chapter[];
  _count?: {
    chapters: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  name: string;
  description?: string;
  order: number;
  subjectId: string;
  subject?: {
    id: string;
    name: string;
    standard?: {
      id: string;
      name: string;
    };
  };
  videoUrl?: string;
  solutionPdfUrl?: string;
  textbookPdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  admin: Admin;
}

export interface CreateStandardData {
  name: string;
  description?: string;
  order: number;
}

export interface CreateSubjectData {
  name: string;
  description?: string;
  order: number;
  standardId: string;
}

export interface CreateChapterData {
  name: string;
  description?: string;
  order: number;
  subjectId: string;
  videoUrl?: string;
  solutionPdfUrl?: string;
  textbookPdfUrl?: string;
}

export interface UploadResponse {
  message: string;
  url: string;
  filename: string;
  originalName: string;
  size: number;
}
