import api from '../lib/api';
import type { ChapterResource, Chapter } from '../types';

export interface ChapterResourcesGrouped {
  chapter: Chapter;
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

export const chapterResourcesAPI = {
  getByChapterGrouped: async (chapterId: string): Promise<ChapterResourcesGrouped> => {
    const response = await api.get<ChapterResourcesGrouped>(`/chapter-resources/chapter/${chapterId}/grouped`);
    return response.data;
  },

  getByChapter: async (chapterId: string): Promise<ChapterResource[]> => {
    const response = await api.get<ChapterResource[]>(`/chapter-resources/chapter/${chapterId}`);
    return response.data;
  },
};
