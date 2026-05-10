import React from 'react';
import useStore from '../store/useStore';
import { getAffinityData } from '../utils/scoringEngine';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, profile, library, updateProfile } = useStore();

  const totalAnime = library.anime?.length || 0;
  const totalMovies = library.movies?.length || 0;
  const totalTV = library.tv?.length || 0;
  const totalMedia = totalAnime + totalMovies + totalTV;

  const topGenres = getAffinityData(library);

  const toggleTheme = () => {
    const newTheme = profile.settings?.theme === 'dark' ? 'light' : 'dark';
    updateProfile({ ...profile.settings, theme: newTheme });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>AI Analytics & Dashboard</h2>
        <p>User: {profile?.username || user.email}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Tracked</h3>
          <div className={styles.bigNumber}>{totalMedia}</div>
          <div className={styles.breakdown}>
            <span>Anime: {totalAnime}</span>
            <span>Movies: {totalMovies}</span>
            <span>TV: {totalTV}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <h3>AI Genre Affinity</h3>
          {topGenres.length === 0 ? (
            <p className={styles.empty}>Add media to calculate affinity.</p>
          ) : (
            <ul className={styles.genreList}>
              {topGenres.map(([genre, count], index) => (
                <li key={genre}>
                  <span className={styles.rank}>#{index + 1}</span> {genre} 
                  <span className={styles.count}>({count} titles)</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.settingsCard}>
        <h3>Preferences</h3>
        <div className={styles.settingRow}>
          <span>Appearance</span>
          <button onClick={toggleTheme} className={styles.themeBtn}>
            Switch to {profile?.settings?.theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;