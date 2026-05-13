import React, { useState } from 'react';
import useStore from '../store/useStore';
import { mediaService } from '../utils/mediaService';
import styles from './SearchBar.module.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('anime');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(5);

  const addMediaItem = useStore((state) => state.addMediaItem);
  const library = useStore((state) => state.library);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);

    try {
      const data = await mediaService.search(query, type);
      setResults(data || []);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to fetch results.');
    } finally {
      setLoading(false);
    }
  };

  const openRatingModal = (item) => {
    const exists = library[type]?.some(
      (libItem) => libItem.id === item.id
    );

    if (exists) {
      alert('Already added to your library.');
      return;
    }

    setSelectedItem(item);
    setRating(5);
  };

  const confirmAdd = () => {
    if (!selectedItem) return;

    const totalEpisodes =
      selectedItem.metadata?.episodeCount || 1;

    const newItem = {
      ...selectedItem,

      userStats: {
        status: 'completed',
        score: rating,
        progress: totalEpisodes,
        totalEpisodes,
        completed: true,
        rewatchCount: 0,
        lastUpdated: new Date().toISOString(),
      },
    };

    addMediaItem(type, newItem);

    setResults((prev) =>
      prev.filter((r) => r.id !== selectedItem.id)
    );

    setSelectedItem(null);
  };

  const cancelAdd = () => {
    setSelectedItem(null);
  };

  return (
    <div className={styles.searchContainer}>
      <form
        onSubmit={handleSearch}
        className={styles.searchForm}
      >
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={styles.select}
        >
          <option value="anime">Anime</option>
          {/* FIXED: Changed from "movie" to "movies" */}
          <option value="movies">Movies</option>
          <option value="tv">TV Shows</option>
        </select>

        <input
          type="text"
          placeholder="Search Anime, Movies or TV Shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
        />

        <button
          type="submit"
          disabled={loading}
          className={styles.button}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className={styles.resultsGrid}>
          {results.map((item) => (
            <div
              key={item.id}
              className={styles.resultCard}
            >
              <img
                src={item.metadata?.poster}
                alt={item.metadata?.title}
                className={styles.poster}
                loading="lazy"
              />
              <div className={styles.info}>
                <h4>{item.metadata?.title}</h4>
                <p>
                  {item.metadata?.releaseDate?.substring(0, 4) || 'Unknown'}
                </p>
                <button
                  onClick={() => openRatingModal(item)}
                  className={styles.addButton}
                >
                  Add to Library
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>{selectedItem.metadata?.title}</h3>
            <p>Mark as completed and rate it.</p>
            <div className={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`${styles.star} ${
                    rating >= star ? styles.starActive : ''
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <div className={styles.modalButtons}>
              <button
                className={styles.cancelBtn}
                onClick={cancelAdd}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                onClick={confirmAdd}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;