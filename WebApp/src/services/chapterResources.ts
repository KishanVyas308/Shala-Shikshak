import api from '../lib/api';
import type { ChapterResource, CreateChapterResourceData } from '../types';

export const chapterResourcesAPI = {
  getByChapter: async (chapterId: string): Promise<ChapterResource[]> => {
    const response = await api.get(`/chapter-resources/chapter/${chapterId}`);
    return response.data;
  },

  getByChapterGrouped: async (chapterId: string): Promise<{
    chapter: {
      id: string;
      name: string;
      subject: any;
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
  }> => {
    const response = await api.get(`/chapter-resources/chapter/${chapterId}/grouped`);
    return response.data;
  },

  getById: async (id: string): Promise<ChapterResource> => {
    const response = await api.get(`/chapter-resources/${id}`);
    return response.data;
  },

  create: async (data: CreateChapterResourceData, file?: File): Promise<ChapterResource> => {
    if (file) {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', data.title);
      formData.append('type', data.type);
      formData.append('resourceType', data.resourceType);
      formData.append('chapterId', data.chapterId);
      if (data.description) formData.append('description', data.description);
      if (data.fileName) formData.append('fileName', data.fileName);
      
      const response = await api.post('/chapter-resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Regular JSON request for URL-based resources
      const response = await api.post('/chapter-resources', data);
      return response.data;
    }
  },

  update: async (id: string, data: Partial<CreateChapterResourceData>, file?: File): Promise<ChapterResource> => {
    if (file) {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      if (data.title) formData.append('title', data.title);
      if (data.type) formData.append('type', data.type);
      if (data.resourceType) formData.append('resourceType', data.resourceType);
      if (data.description) formData.append('description', data.description);
      if (data.fileName) formData.append('fileName', data.fileName);
      
      const response = await api.put(`/chapter-resources/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Regular JSON request for URL-based resources
      const response = await api.put(`/chapter-resources/${id}`, data);
      return response.data;
    }
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/chapter-resources/${id}`);
  },

  removeFile: async (id: string): Promise<ChapterResource> => {
    const response = await api.delete(`/chapter-resources/${id}/file`);
    return response.data;
  }
};
