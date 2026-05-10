import React from 'react';
import styles from './Landing.module.css';

const Landing = ({ onGetStarted }) => {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <h2>🎬 ProfishnalWatcher</h2>
        <button className={styles.loginBtn} onClick={onGetStarted}>
          Log In
        </button>
      </nav>

      <main className={styles.hero}>
        <h1 className={styles.title}>Track your media, intelligently.</h1>
        <p className={styles.subtitle}>
          The ultimate database-lite tracker for Anime, Movies, and TV Shows. 
          Powered by a local deterministic AI engine to automatically rank and categorize your favorites.
        </p>
        <button className={styles.ctaBtn} onClick={onGetStarted}>
          Get Started for Free
        </button>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <h3>Unified Library</h3>
            <p>Track anime, movies, and TV shows side-by-side using real-time TMDB and Jikan metadata.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>AI Tier System</h3>
            <p>Our custom heuristic engine scores your titles based on your ratings and completion consistency.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>100% Free Portability</h3>
            <p>Your library is stored securely as JSON. Export your data at any time.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;