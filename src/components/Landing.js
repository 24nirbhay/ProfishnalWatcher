import React from 'react';
import styles from './Landing.module.css';

const Landing = ({ onAction, user }) => {
  return (
    <div className={styles.container}>
      <div className={styles.stars}></div>
      <div className={styles.twinkling}></div>

      <nav className={styles.nav}>
        <h2 style={{ cursor: 'pointer' }} onClick={() => onAction(user ? 'library' : 'landing')}>
          profishnalwatcher
        </h2>
        {/* Hides login if user exists, replaces with library link */}
        {user ? (
          <button className={styles.navBtn} onClick={() => onAction('library')}>
            My Library
          </button>
        ) : (
          <button className={styles.navBtn} onClick={() => onAction('auth')}>
            Login
          </button>
        )}
      </nav>

      <main className={styles.hero}>
        <h1 className={styles.titleGradient}>
          CURATE YOUR ULTIMATE LISTS
        </h1>
        <p className={styles.subtitle}>
          The definitive tracking nexus for Anime, Movies, and TV Shows. 
          Ready for the future.
        </p>
        <button className={styles.glowButton} onClick={() => onAction(user ? 'library' : 'auth')}>
          {user ? 'Enter Your Matrix' : 'Start Tracking'}
        </button>
      </main>

      <footer className={styles.footerMarquee}>
        <span>ANIME LISTS &nbsp;&nbsp; // &nbsp;&nbsp; MOVIE TRACKING &nbsp;&nbsp; // &nbsp;&nbsp; TV SHOWS &nbsp;&nbsp; // &nbsp;&nbsp; AI RANKINGS &nbsp;&nbsp; // &nbsp;&nbsp; JSON EXPORT</span>
      </footer>
    </div>
  );
};

export default Landing;