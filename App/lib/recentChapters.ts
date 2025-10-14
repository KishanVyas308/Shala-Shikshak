import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_CHAPTERS_KEY = 'recent_chapters';
const MAX_RECENT = 5;

export type RecentChapter = {
  id: string;
  title: string;
  subject: string;
  standard: string;
};

export async function addRecentChapter(chapter: RecentChapter) {
  try {
    const data = await AsyncStorage.getItem(RECENT_CHAPTERS_KEY);
    let recent: RecentChapter[] = data ? JSON.parse(data) : [];
    // Remove if already exists
    recent = recent.filter(c => c.id !== chapter.id);
    // Add to front
    recent.unshift(chapter);
    // Keep only 5
    if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);
    await AsyncStorage.setItem(RECENT_CHAPTERS_KEY, JSON.stringify(recent));
  } catch (e) {
    // Ignore errors
  }
}

export async function getRecentChapters(): Promise<RecentChapter[]> {
  try {
    const data = await AsyncStorage.getItem(RECENT_CHAPTERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
