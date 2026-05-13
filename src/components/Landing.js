import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Landing.module.css';

const ANIME_POSTERS = [
  "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
  "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
  "https://cdn.myanimelist.net/images/anime/3/40451.jpg",
  "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
  "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
  "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
  "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
  "https://cdn.myanimelist.net/images/anime/3/40451.jpg",
  "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
  "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
];

const Landing = ({ onAction, user }) => {
  const posters = [...ANIME_POSTERS, ...ANIME_POSTERS, ...ANIME_POSTERS];
  const [rankings, setRankings] = useState([]);
  const [userRankings, setUserRankings] = useState([]);

  // Fetch both Media Rankings and User Rankings from our Supabase Views
  useEffect(() => {
    const fetchLeaderboards = async () => {
      // Fetch Media Rankings
      const { data: mediaData } = await supabase
        .from('global_media_rankings')
        .select('*');
      if (mediaData) setRankings(mediaData);

      // Fetch User Rankings and order them by tracked items to ensure they display properly
      const { data: userData } = await supabase
        .from('global_user_rankings')
        .select('*')
        .order('total_tracked_items', { ascending: false });
      if (userData) setUserRankings(userData);
    };
    
    fetchLeaderboards();
  }, []);

  // Split Media rankings into Podium (Top 3) and the List (4-15)
  const top3Media = rankings.slice(0, 3);
  const next12Media = rankings.slice(3, 15);

  // Split User rankings into Podium (Top 3) and the List (4-15)
  const top3Users = userRankings.slice(0, 3);
  const next12Users = userRankings.slice(3, 15);

  return (
    <div className={styles.container}>

      <div className={styles.carouselContainer}>
        <div className={styles.carouselTrack}>
          {posters.map((poster, index) => (
            <img
              key={index}
              src={poster}
              alt="poster"
              className={styles.carouselImage}
              loading="lazy"
            />
          ))}
        </div>
      </div>

      <div className={styles.carouselOverlay}></div>

      <nav className={styles.nav}>
        <h2 onClick={() => onAction(user ? 'library' : 'landing')}>
          profishnalwatcher
        </h2>

        <button
          className={styles.navBtn}
          onClick={() => onAction(user ? 'library' : 'auth')}
        >
          {user ? 'Library' : 'Login'}
        </button>
      </nav>

      <main className={styles.hero}>
        <h1 className={styles.titleGradient}>
          Track Everything.
        </h1>
        
        <p className={styles.subtitle}>
          Anime • Movies • TV Shows
        </p>

        <button
          className={styles.glowButton}
          onClick={() => onAction(user ? 'library' : 'auth')}
        >
          {user ? 'Open Library' : 'Start'}
        </button>
        <p className={styles.description}>
          Join the nexus. Log your watched media, rate your favorites, and climb the global leaderboard.
        </p>
      </main>

      {/* --- MEDIA RANKING SECTION --- */}
      <section className={styles.rankingSection}>
        <h2 className={styles.rankingHeader}>Global Matrix Rankings</h2>

        {rankings.length > 0 ? (
          <>
            <div className={styles.top3Grid}>
              {top3Media.map((item, index) => (
                <div key={item.id} className={styles.top3Card}>
                  <h3 className={styles.rankNumber}>#{index + 1}</h3>
                  <img src={item.poster} alt={item.title} className={styles.rankingPoster} />
                  <div className={styles.rankingInfo}>
                    <h4>{item.title}</h4>
                    <span className={styles.ratingScore}>⭐ {item.average_score}</span>
                    <span className={styles.userCount}>({item.total_users_added} Users)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.top15List}>
              {next12Media.map((item, index) => (
                <div key={item.id} className={styles.listItem}>
                  <span className={styles.listRank}>#{index + 4}</span>
                  <span className={styles.listTitle}>{item.title}</span>
                  <span className={styles.listScore}>⭐ {item.average_score}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className={styles.loadingText}>Initializing ranking matrix...</p>
        )}
      </section>

      {/* --- USER LEADERBOARD SECTION --- */}
      <section className={styles.userRankingSection}>
        <h2 className={styles.rankingHeader}>Top Trackers</h2>

        {userRankings.length > 0 ? (
          <>
            <div className={styles.top3Grid}>
              {/* Podium for Top 3 */}
              {top3Users.map((u, index) => (
                <div key={u.id} className={`${styles.top3CardUser} ${styles[`rank${index + 1}`]}`}>
                  <div className={styles.cardContent}>
                    <h3 className={styles.rankNumber}>#{index + 1}</h3>
                    <div className={styles.userAvatarPlaceholder}>
                       {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.rankingInfo}>
                      <h4>@{u.username}</h4>
                    </div>
                  </div>
                  {/* Goon Level placed at the bottom for Top 3 */}
                  <div className={styles.goonLevelBottom}>
                    <span className={styles.ratingScore}>⚔️ Goon Level: {u.total_tracked_items}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.top15List}>
              {/* List layout for #4 - #15 */}
              {next12Users.map((u, index) => (
                <div key={u.id} className={styles.listItem}>
                  <div className={styles.listLeft}>
                    <span className={styles.listRank}>{index + 4}</span>
                    <div className={styles.listAvatarPlaceholder}>
                       {u.username.charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.listTitle}>@{u.username}</span>
                  </div>
                  {/* Goon Level placed at the side for the rest */}
                  <div className={styles.listRight}>
                    <span className={styles.listScore}>⚔️ Goon Level: {u.total_tracked_items}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className={styles.loadingText}>Loading top trackers...</p>
        )}
      </section>

    </div>
  );
};

export default Landing;