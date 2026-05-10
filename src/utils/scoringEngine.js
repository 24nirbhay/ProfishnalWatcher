/**
 * AI Scoring Engine (Deterministic Heuristics)
 * Updated for the 5-Star Rating System
 */

export const scoringEngine = {
  calculateTier: (starRating) => {
    // Translates a 1-5 star rating into a Tier
    if (starRating >= 5) return 'S';
    if (starRating >= 4) return 'A';
    if (starRating >= 3) return 'B';
    if (starRating >= 2) return 'C';
    return 'D';
  }
};

/**
 * Analytics Engine
 * Groups library items by genre to find affinity (Used in Profile.js)
 */
export const getAffinityData = (library) => {
  // Add safety fallbacks in case a library category is undefined
  const allMedia = [
    ...(library.anime || []), 
    ...(library.movies || []), 
    ...(library.tv || [])
  ];
  
  const genreCounts = {};

  allMedia.forEach(item => {
    // Safety check in case genres array is missing
    if (item.metadata && item.metadata.genres) {
      item.metadata.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });

  return Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3); // Return Top 3 Genres
};