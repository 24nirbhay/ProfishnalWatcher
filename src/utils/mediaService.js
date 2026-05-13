/**
 * Media Service Utility
 * Normalizes Jikan (Anime) and Unofficial IMDb data into a 
 * Unified Media Object (UMO).
 */

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

/**
 * Helper to normalize Anime from Jikan
 */
const normalizeAnime = (anime) => ({
  id: `anime-${anime.mal_id}`,
  externalId: anime.mal_id,
  source: 'jikan',
  type: 'anime',
  metadata: {
    title: anime.title,
    altTitles: anime.titles?.map(t => t.title) || [],
    poster: anime.images?.jpg?.large_image_url,
    banner: anime.images?.jpg?.image_url,
    genres: anime.genres?.map(g => g.name) || [],
    synopsis: anime.synopsis,
    releaseDate: anime.aired?.from,
    episodeCount: anime.episodes || 0,
    status: anime.status,
    score: anime.score,
    studio: anime.studios?.[0]?.name || 'Unknown',
  }
});

/**
 * Helper to normalize Movies/TV from OMDB API
 */
const normalizeOmdb = (item, type) => {
  // Map the specific fields from the OMDB API
  const title = item.Title || 'Unknown';
  const year = item.Year || 'Unknown';
  const imdbId = item.imdbID || Math.random().toString();
  const poster = item.Poster && item.Poster !== 'N/A' ? item.Poster : 'https://via.placeholder.com/500x750?text=No+Poster';

  return {
    id: `${type}-${imdbId}`,
    externalId: imdbId,
    source: 'omdb',
    type: type, // 'movie' or 'tv'
    metadata: {
      title: title,
      altTitles: [], 
      poster: poster,
      banner: poster, 
      genres: [], 
      synopsis: '', 
      releaseDate: year.toString(),
      episodeCount: 1, 
      status: 'Released',
      score: 0, 
      studio: 'OMDB', 
    }
  };
};

export const mediaService = {
  search: async (query, type = 'anime') => {
    if (type === 'anime') {
      const response = await fetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=10`);
      const json = await response.json();
      return json.data.map(normalizeAnime);
    } else {
      // Ping our Vercel Serverless Function to use OMDB API with CORS bypass
      const omdbType = type === 'tv' ? 'series' : 'movie';
      const response = await fetch(`/api/imdb?q=${encodeURIComponent(query)}&type=${omdbType}`);
      const json = await response.json();
      
      // OMDB returns Search array when successful
      if (json.Response === 'False') {
        return [];
      }
      
      const resultsArray = json.Search || [];

      // Map the results array through our normalizer
      return resultsArray.map(item => normalizeOmdb(item, type));
    }
  }
};