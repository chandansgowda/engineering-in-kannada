import ytpl from 'ytpl';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PLAYLISTS = [
  { id: 'python-fundamentals', playlistId: 'PLlGueSbLhZoBRnTsGiDJeTXuQCALOTN07' },
  { id: 'python-oops',         playlistId: 'PLlGueSbLhZoBYR3nMpsEdtg_pf13eO0bD'  },
  { id: 'web-dev-manjunath',   playlistId: 'PLlGueSbLhZoAd3iIu-ZsX-YPeYnxrvUwG'  },
  { id: 'c-fundamentals',      playlistId: 'PLlGueSbLhZoCEMAeoeXoyd3NFnkR4iUP3'  },
  { id: 'dsa-c',               playlistId: 'PLlGueSbLhZoCNnEEoeOXICh0k4wz0hG-V'  },
];

for (const course of PLAYLISTS) {
  console.log(`\nFetching: ${course.id} (${course.playlistId})`);
  try {
    const playlist = await ytpl(course.playlistId, { limit: Infinity });
    const videos = playlist.items.map((item, i) => ({
      videoId: item.id,
      title: item.title,
      thumbnail: item.bestThumbnail?.url ?? `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`,
      description: '',
      position: i,
    }));

    const outPath = join(__dirname, `../src/data/playlists/${course.id}.json`);
    writeFileSync(outPath, JSON.stringify({ courseId: course.id, videos }, null, 2));
    console.log(`  ✓ Saved ${videos.length} videos → src/data/playlists/${course.id}.json`);
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
  }
}
