import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Landing.module.css';

const Landing = ({ onAction, user }) => {
  const [rankings, setRankings] = useState([]);
  const [userRankings, setUserRankings] = useState([]);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      // Fetch Media Rankings with error logging
      const { data: mediaData, error: mediaError } = await supabase
        .from('global_media_rankings')
        .select('*');
        
      if (mediaError) console.error("Supabase Media View Error:", mediaError.message);
      if (mediaData) setRankings(mediaData);

      // Fetch User Rankings with error logging
      const { data: userData, error: userError } = await supabase
        .from('global_user_rankings')
        .select('*')
        .order('total_tracked_items', { ascending: false });
        
      if (userError) console.error("Supabase User View Error:", userError.message);
      if (userData) setUserRankings(userData);
    };
    
    fetchLeaderboards();
  }, []);

  const backgroundPosters = rankings.length > 0 ? rankings.map(r => r.poster) : [];
  const featuredMedia = rankings[0];
  const previewMedia = rankings.slice(1, 3);
  const carouselMedia = rankings.slice(3, 15);
  const topUsers = userRankings.slice(0, 15);

  return (
    <div className={styles.container}>
      {/* Background Visuals */}
      <div className={styles.background}>
        {/* [BACKGROUND_MP4_PLACEHOLDER] Replace src with your actual .mp4 path */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className={styles.backgroundVideo}
        >
          <source src="/placeholder-bg.mp4" type="video/mp4" />
        </video>

        {backgroundPosters.length > 0 && (
          <div className={styles.backgroundVisuals}>
            {[...backgroundPosters, ...backgroundPosters].map((poster, index) => (
              <div key={index} className={styles.bgImageContainer}>
                <img src={poster} alt="" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <h1 className={styles.logo} onClick={() => onAction(user ? 'library' : 'landing')}>
            profishnalwatcher
          </h1>
          <div className={styles.navActions}>
            <button className={styles.navButton} onClick={() => onAction(user ? 'library' : 'auth')}>
              {user ? 'Open Library' : 'Login / Sign Up'}
            </button>
          </div>
        </div>
      </nav>

      <div className={styles.pageContent}>
        {/* Hero Section */}
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.categoryPills}>
              <span>Anime</span>
              <span>Movies</span>
              <span>TV Shows</span>
            </div>
            <h1 className={styles.heroTitle}>Track Everything. Master Your Matrix.</h1>
            <p className={styles.heroSubtitle}>
              Join the nexus. Log your watched media, rate your favorites, and climb the global leaderboard to increase your Goon Level.
            </p>
            <button className={styles.heroButton} onClick={() => onAction(user ? 'library' : 'auth')}>
              {user ? 'Enter Library' : 'Start Tracking'}
            </button>
          </div>

          {featuredMedia && (
            <div className={styles.heroVisuals}>
              <div className={styles.previewCards}>
                {previewMedia.map((item, index) => (
                  <div key={item.id} className={styles.previewCard} style={{'--index': index}}>
                    <img src={item.poster} alt={item.title} />
                  </div>
                ))}
              </div>
              <div className={styles.featuredCard}>
                <img src={featuredMedia.poster} alt={featuredMedia.title} className={styles.featuredImage} />
                <div className={styles.featuredOverlay}>
                  <h3>{featuredMedia.title}</h3>
                  <div className={styles.featuredStats}>
                    <span>⭐ {featuredMedia.average_score}</span>
                    <span>{featuredMedia.total_users_added} Users</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* [TRENDING_SECTION] -> Global Matrix Rankings */}
        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Global Matrix Rankings</h2>
          <div className={styles.carouselRow}>
            {carouselMedia.map((item, index) => (
              <div key={item.id} className={styles.mediaCard}>
                <img src={item.poster} alt={item.title} />
                <div className={styles.cardOverlay}>
                  <div className={styles.cardRank}>#{index + 4}</div>
                  <div className={styles.cardTitle}>{item.title}</div>
                  <div className={styles.cardInfo}>⭐ {item.average_score}</div>
                </div>
              </div>
            ))}
            {rankings.length === 0 && <p className={styles.loadingText}>Initializing ranking matrix...</p>}
          </div>
        </section>

        {/* [AI_GENERATED_MODULE] -> Top Trackers */}
        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Top Trackers</h2>
          <div className={styles.carouselRow}>
            {topUsers.map((user, index) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userCardRank}>#{index + 1}</div>
                <div className={styles.userCardContent}>
                  <div className={styles.userAvatar}>
                    {user.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className={styles.userName}>@{user.username}</div>
                  <div className={styles.userLevel}>⚔️ Goon Level: {user.total_tracked_items}</div>
                </div>
              </div>
            ))}
            {userRankings.length === 0 && <p className={styles.loadingText}>Loading top trackers...</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;