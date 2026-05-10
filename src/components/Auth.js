import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Auth.module.css';

const Auth = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dummyEmail = `${username.toLowerCase().trim()}@profishnalwatcher.local`;

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: dummyEmail,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: dummyEmail,
          password,
        });
        if (error) throw error;
        // The database trigger now handles profile creation automatically!
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>{isLogin ? 'INITIATE LINK' : 'JOIN THE NEXUS'}</h2>
        {error && <p className={styles.error}>{error}</p>}
        
        <form onSubmit={handleAuth} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>USERNAME</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your alias"
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>PASSWORD</label>
            <div className={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter clearance code"
                className={styles.input}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeBtn}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.glowButton}>
            {loading ? 'PROCESSING...' : (isLogin ? 'LOG IN' : 'SIGN UP')}
          </button>
        </form>

        <p className={styles.toggleText}>
          {isLogin ? "NO ACCESS? " : "HAVE CLEARANCE? "}
          <span onClick={() => setIsLogin(!isLogin)} className={styles.toggleLink}>
            {isLogin ? 'REQUEST ACCESS' : 'LOGIN'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;