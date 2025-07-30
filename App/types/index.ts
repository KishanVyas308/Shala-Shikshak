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
  subjectId: string;
  subject?: {
    id: string;
    name: string;
    standard?: {
      id: string;
      name: string;
    };
  };
  resources?: ChapterResource[];
  groupedResources?: {
    svadhyay: ChapterResource[];
    svadhyay_pothi: ChapterResource[];
    other: ChapterResource[];
  };
  _count?: {
    resources: number;
  };
  videoUrl?: string;
  textbookPdfUrl?: string;
  textbookPdfFileId?: string;
  textbookPdfFileName?: string;
  solutionPdfUrl?: string;
  solutionPdfFileId?: string;
  solutionPdfFileName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterResource {
  id: string;
  title: string;
  description?: string;
  type: 'svadhyay' | 'svadhyay_pothi' | 'other';
  resourceType: 'video' | 'pdf';
  url: string;
  fileName?: string;
  chapterId: string;
  chapter?: Chapter;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  admin: Admin;
  token: string;
}

export interface CreateStandardRequest {
  name: string;
  description?: string;
  order: number;
}

export interface UpdateStandardRequest {
  name?: string;
  description?: string;
  order?: number;
}

export interface CreateSubjectRequest {
  name: string;
  description?: string;
  standardId: string;
}

export interface UpdateSubjectRequest {
  name?: string;
  description?: string;
}

export interface CreateChapterRequest {
  name: string;
  description?: string;
  subjectId: string;
  videoUrl?: string;
  textbookPdfUrl?: string;
  solutionPdfUrl?: string;
}

export interface UpdateChapterRequest {
  name?: string;
  description?: string;
  videoUrl?: string;
  textbookPdfUrl?: string;
  solutionPdfUrl?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
