import React, { useState } from 'react';
import useStore from '../store/useStore';
import { mediaService } from '../utils/mediaService';
import styles from './SearchBar.module.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('anime');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const addMediaItem = useStore((state) => state.addMediaItem);
  const library = useStore((state) => state.library);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await mediaService.search(query, type);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Failed to search. Check API keys or connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item) => {
    // Prevent duplicates
    const exists = library[type].some(libItem => libItem.id === item.id);
    if (exists) {
      alert("This item is already in your library!");
      return;
    }
    
    // Initialize default user stats for the new item
    const newItem = {
      ...item,
      userStats: {
        status: 'plan_to_watch',
        score: 0,
        progress: 0,
        totalEpisodes: item.metadata.episodeCount || 1,
        rewatchCount: 0,
        lastUpdated: new Date().toISOString()
      }
    };
    
    addMediaItem(type, newItem);
    setResults(results.filter(r => r.id !== item.id)); // Remove from results after adding
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className={styles.select}
        >
          <option value="anime">Anime (Jikan)</option>
          <option value="movie">Movies (OMDB)</option>
          <option value="tv">TV Shows (OMDB)</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Search for media..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
        />
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className={styles.resultsGrid}>
          {results.map((item) => (
            <div key={item.id} className={styles.resultCard}>
              <img src={item.metadata.poster} alt={item.metadata.title} className={styles.poster} />
              <div className={styles.info}>
                <h4>{item.metadata.title}</h4>
                <p>{item.metadata.releaseDate?.substring(0, 4)}</p>
                <button onClick={() => handleAdd(item)} className={styles.addButton}>
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;