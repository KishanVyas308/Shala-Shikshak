import { api } from '../lib/api';

export interface ChapterResource {
  id: string;
  title: string;
  description?: string;
  type: 'svadhyay' | 'svadhyay_pothi' | 'other';
  resourceType: 'video' | 'pdf';
  url: string;
  fileName?: string;
  chapterId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedChapterResources {
  chapter: {
    id: string;
    name: string;
    subject: {
      id: string;
      name: string;
      standard: {
        id: string;
        name: string;
      };
    };
  };
  resources: {
    svadhyay: ChapterResource[];
    svadhyay_pothi: ChapterResource[];
    other: ChapterResource[];
  };
  counts: {
    svadhyay: number;
    svadhyay_pothi: number;
    other: number;
    total: number;
  };
}

export interface CreateChapterResourceRequest {
  title: string;
  description?: string;
  type: 'svadhyay' | 'svadhyay_pothi' | 'other';
  resourceType: 'video' | 'pdf';
  url?: string;
  file?: File;
  chapterId: string;
}

export interface UpdateChapterResourceRequest {
  title?: string;
  description?: string;
  type?: 'svadhyay' | 'svadhyay_pothi' | 'other';
  resourceType?: 'video' | 'pdf';
  url?: string;
  file?: File;
}

export const chapterResourcesAPI = {
  // Get all resources for a chapter
  getByChapter: async (chapterId: string): Promise<ChapterResource[]> => {
    const response = await api.get(`/chapter-resources/chapter/${chapterId}`);
    return response.data;
  },

  // Get resources grouped by type for a chapter
  getGroupedByChapter: async (chapterId: string): Promise<GroupedChapterResources> => {
    const response = await api.get(`/chapter-resources/chapter/${chapterId}/grouped`);
    return response.data;
  },

  // Get single resource
  getById: async (id: string): Promise<ChapterResource> => {
    const response = await api.get(`/chapter-resources/${id}`);
    return response.data;
  },

  // Create new resource
  create: async (data: CreateChapterResourceRequest): Promise<ChapterResource> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('type', data.type);
    formData.append('resourceType', data.resourceType);
    formData.append('chapterId', data.chapterId);
    
    if (data.file) {
      formData.append('file', data.file);
    } else if (data.url) {
      formData.append('url', data.url);
    }

    const response = await api.post('/chapter-resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update resource
  update: async (id: string, data: UpdateChapterResourceRequest): Promise<ChapterResource> => {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.type) formData.append('type', data.type);
    if (data.resourceType) formData.append('resourceType', data.resourceType);
    
    if (data.file) {
      formData.append('file', data.file);
    } else if (data.url) {
      formData.append('url', data.url);
    }

    const response = await api.put(`/chapter-resources/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete resource
  delete: async (id: string): Promise<void> => {
    await api.delete(`/chapter-resources/${id}`);
  },
};
