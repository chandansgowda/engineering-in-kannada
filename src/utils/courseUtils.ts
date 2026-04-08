import { VideoData } from '../types';

export async function getTotalVideos(courseId: string): Promise<number> {
  try {
    const data = await import(`../data/playlists/${courseId}.json`);
    if (data.videos?.length) return data.videos.length;
  } catch { /* fall through */ }
  try {
    const data = (await import(`../data/videos/${courseId}.json`)) as VideoData;
    return data.videos.length;
  } catch {
    return 0;
  }
} 