/**
 * Media Service Utility
 * Normalizes Jikan (Anime) and Unofficial IMDb data into a 
 * Unified Media Object (UMO).
 */

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const PLACEHOLDER_POSTER = 'https://via.placeholder.com/500x750?text=No+Poster';

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
  const poster = item.Poster && item.Poster !== 'N/A' ? item.Poster : PLACEHOLDER_POSTER;

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

const fetchWikimediaPoster = async (title, year) => {
  const query = encodeURIComponent([title, year].filter(Boolean).join(' '));
  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=500&format=json&origin=*`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    const page = json?.query?.pages ? Object.values(json.query.pages)[0] : null;
    return page?.thumbnail?.source || PLACEHOLDER_POSTER;
  } catch {
    return PLACEHOLDER_POSTER;
  }
};

const enrichPoster = async (item) => {
  if (item?.metadata?.poster && item.metadata.poster !== PLACEHOLDER_POSTER) return item;

  const poster = await fetchWikimediaPoster(item?.metadata?.title, item?.metadata?.releaseDate?.slice(0, 4));
  return {
    ...item,
    metadata: {
      ...item.metadata,
      poster,
      banner: poster,
    },
  };
};

export const mediaService = {
  search: async (query, type = 'anime') => {
    if (type === 'anime') {
      const response = await fetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=20`);
      const json = await response.json();
      return json.data.map(normalizeAnime);
    } else {
      // Ping our Vercel Serverless Function to use OMDB API with CORS bypass
      const omdbType = type === 'tv' ? 'series' : 'movie';
      const response = await fetch(`/api/imdb?q=${encodeURIComponent(query)}&type=${omdbType}`);
      const text = await response.text();

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { Response: 'False', Error: 'Unexpected non-JSON response' };
      }
      
      // OMDB returns Search array when successful
      if (json.Response === 'False') {
        return [];
      }
      
      const resultsArray = json.Search || [];

      // Map the results array through our normalizer
      const normalized = resultsArray.map(item => normalizeOmdb(item, type));
      return Promise.all(normalized.map(enrichPoster));
    }
  }
};