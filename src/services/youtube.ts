const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;
const BASE = 'https://www.googleapis.com/youtube/v3';

export interface PlaylistVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  description: string;
  position: number;
}

// Extract videoId from a YouTube URL (watch?v=... or youtu.be/...)
function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('?')[0];
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}

// Fallback: load from static playlist JSON files (no API key needed)
export async function loadLocalVideos(courseId: string): Promise<PlaylistVideo[]> {
  try {
    const data = await import(`../data/playlists/${courseId}.json`);
    return (data.videos ?? []) as PlaylistVideo[];
  } catch {
    // fallback to old sparse video JSON if playlist file missing
    try {
      const data = await import(`../data/videos/${courseId}.json`);
      return (data.videos ?? []).map((v: any, i: number) => {
        const videoId = extractVideoId(v.youtubeUrl) ?? '';
        return { videoId, title: v.title, thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, description: '', position: i };
      }).filter((v: PlaylistVideo) => v.videoId);
    } catch {
      return [];
    }
  }
}

// Fetch all videos from a YouTube playlist via the Data API v3
export async function fetchPlaylistVideos(playlistId: string): Promise<PlaylistVideo[]> {
  if (!API_KEY) return [];

  const videos: PlaylistVideo[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: '50',
      key: API_KEY,
      ...(pageToken ? { pageToken } : {}),
    });

    const res = await fetch(`${BASE}/playlistItems?${params}`);
    if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);

    const data = await res.json();
    pageToken = data.nextPageToken;

    for (const item of data.items ?? []) {
      const snippet = item.snippet;
      const videoId = snippet?.resourceId?.videoId;
      if (!videoId || snippet?.title === 'Deleted video' || snippet?.title === 'Private video') continue;

      videos.push({
        videoId,
        title: snippet.title,
        thumbnail:
          snippet.thumbnails?.medium?.url ??
          snippet.thumbnails?.default?.url ??
          `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        description: snippet.description ?? '',
        position: snippet.position ?? videos.length,
      });
    }
  } while (pageToken);

  return videos.sort((a, b) => a.position - b.position);
}
