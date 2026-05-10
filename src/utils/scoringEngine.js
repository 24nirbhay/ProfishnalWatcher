/**
 * AI Scoring Engine (Deterministic Heuristics)
 * Formula: Score = (UserRating * 0.6) + (CompletionRate * 0.4)
 */

export const calculateScore = (userStats) => {
  const { score = 0, progress = 0, totalEpisodes = 1 } = userStats;
  
  // 1. Normalize Rating (0-10)
  const ratingWeight = 0.6;
  const weightedRating = score * ratingWeight;

  // 2. Completion Weight (0-10)
  const completionWeight = 0.4;
  const completionRate = Math.min(progress / (totalEpisodes || 1), 1);
  const weightedCompletion = (completionRate * 10) * completionWeight;

  // 3. Total Engine Score
  const finalScore = weightedRating + weightedCompletion;

  // 4. Tier Assignment
  let tier = 'D';
  if (finalScore >= 9.0) tier = 'S';
  else if (finalScore >= 7.5) tier = 'A';
  else if (finalScore >= 6.0) tier = 'B';
  else if (finalScore >= 4.0) tier = 'C';

  return {
    score: parseFloat(finalScore.toFixed(2)),
    tier: tier
  };
};

/**
 * Analytics Engine
 * Groups library items by genre to find affinity
 */
export const getAffinityData = (library) => {
  const allMedia = [...library.anime, ...library.movies, ...library.tv];
  const genreCounts = {};

  allMedia.forEach(item => {
    item.metadata.genres.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  return Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3); // Return Top 3
};