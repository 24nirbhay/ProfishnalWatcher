import React, { useState } from 'react';
import useStore from '../store/useStore';
import { calculateScore } from '../utils/scoringEngine';
import styles from './LibraryGrid.module.css';

const LibraryGrid = () => {
  const [activeTab, setActiveTab] = useState('anime');
  const library = useStore((state) => state.library);
  const removeMediaItem = useStore((state) => state.removeMediaItem);

  const activeLibrary = library[activeTab] || [];

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'anime' ? styles.active : ''}`}
          onClick={() => setActiveTab('anime')}
        >
          Anime ({library.anime?.length || 0})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'movie' ? styles.active : ''}`}
          onClick={() => setActiveTab('movie')}
        >
          Movies ({library.movies?.length || 0})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'tv' ? styles.active : ''}`}
          onClick={() => setActiveTab('tv')}
        >
          TV Shows ({library.tv?.length || 0})
        </button>
      </div>

      {activeLibrary.length === 0 ? (
        <div className={styles.empty}>Your {activeTab} library is empty.</div>
      ) : (
        <div className={styles.grid}>
          {activeLibrary.map((item) => {
            const aiData = calculateScore(item.userStats);
            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.posterContainer}>
                  <img src={item.metadata.poster} alt={item.metadata.title} className={styles.poster} />
                  <div className={`${styles.tierBadge} ${styles[`tier${aiData.tier}`]}`}>
                    {aiData.tier} Tier
                  </div>
                </div>
                <div className={styles.content}>
                  <h3 className={styles.title}>{item.metadata.title}</h3>
                  <div className={styles.stats}>
                    <span>Progress: {item.userStats.progress} / {item.metadata.episodeCount || '?'}</span>
                    <span>Score: {item.userStats.score}/10</span>
                  </div>
                  <button 
                    onClick={() => removeMediaItem(activeTab, item.id)} 
                    className={styles.deleteButton}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LibraryGrid;