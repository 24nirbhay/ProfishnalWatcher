import React, { useRef } from 'react';
import useStore from '../store/useStore';
import styles from './ImportExport.module.css';

const ImportExport = () => {
  const library = useStore((state) => state.library);
  const updateLibrary = useStore((state) => state.updateLibrary);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(library, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `media_tracker_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // The Data Cleaner: Strips junk and provides safe fallbacks
  const sanitizeItem = (item, defaultType) => {
    return {
      // 1. Core Identifiers
      id: item.id || item.mal_id || item.imdbID || `${defaultType}-${Math.random().toString(36).substr(2, 9)}`,
      type: item.type || defaultType,
      
      // 2. Metadata (What it is)
      metadata: {
        title: item.metadata?.title || item.title || item.name || 'Unknown Title',
        poster: item.metadata?.poster || item.poster || item.image_url || 'https://via.placeholder.com/500x750?text=No+Poster',
        genres: Array.isArray(item.metadata?.genres) ? item.metadata.genres : [],
        releaseDate: item.metadata?.releaseDate || item.releaseDate || item.year || 'Unknown',
        episodeCount: item.metadata?.episodeCount || item.episodeCount || item.episodes || 1,
      },

      // 3. User Stats (How the user interacted with it)
      userStats: {
        status: item.userStats?.status || item.status || item.watch_status || 'completed',
        score: parseInt(item.userStats?.score || item.score || item.my_score || item.rating || 0),
        progress: parseInt(item.userStats?.progress || item.progress || item.watched_episodes || 1),
        totalEpisodes: parseInt(item.userStats?.totalEpisodes || item.episodeCount || 1),
        completed: item.userStats?.completed !== undefined ? item.userStats.completed : true,
        rewatchCount: parseInt(item.userStats?.rewatchCount || 0),
        lastUpdated: item.userStats?.lastUpdated || new Date().toISOString()
      }
    };
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        
        // Ensure the base object has our three arrays, even if the imported JSON didn't
        const rawAnime = Array.isArray(parsed.anime) ? parsed.anime : [];
        const rawMovies = Array.isArray(parsed.movies) ? parsed.movies : [];
        const rawTv = Array.isArray(parsed.tv) ? parsed.tv : [];

        // Pass every item through the sanitizer to clean the data
        const cleanedLibrary = {
          anime: rawAnime.map(item => sanitizeItem(item, 'anime')),
          movies: rawMovies.map(item => sanitizeItem(item, 'movie')),
          tv: rawTv.map(item => sanitizeItem(item, 'tv'))
        };
        
        if (window.confirm(`Found ${cleanedLibrary.anime.length} Anime, ${cleanedLibrary.movies.length} Movies, and ${cleanedLibrary.tv.length} TV Shows. Overwrite your current cloud library?`)) {
          await updateLibrary(cleanedLibrary);
          alert("Library successfully cleaned, imported, and synced!");
        }
      } catch (err) {
        alert("Failed to process JSON file: " + err.message);
      }
      // Reset input so the user can import the same file again if needed
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h3>Data Portability</h3>
        <p>Your data belongs to you. Export your library for safekeeping or import a previous backup. Modifying data locally and re-importing also works.
          EXPORT KRLO KALKO UDD GAYA TO MEREPASS MTT AANA.
        </p>
        <div className={styles.actions}>
          <button onClick={handleExport} className={styles.exportBtn}>
            Export to JSON
          </button>
          
          <button onClick={() => fileInputRef.current.click()} className={styles.importBtn}>
            Import from JSON
          </button>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImport} 
            style={{ display: 'none' }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ImportExport;