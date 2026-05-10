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

    // Format username into a dummy email to bypass Supabase limits
    const dummyEmail = `${username.toLowerCase().trim()}@profishnalwatcher.local`;

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: dummyEmail,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: dummyEmail,
          password,
        });
        if (error) throw error;
        
        // Ensure the unique username is saved to the profiles table
        if (data.user) {
          await supabase.from('profiles').insert([
            { id: data.user.id, username: username }
          ]);
        }
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
        <h2>{isLogin ? 'Welcome Back' : 'Join profishnalwatcher'}</h2>
        {error && <p className={styles.error}>{error}</p>}
        
        <form onSubmit={handleAuth}>
          <div className={styles.inputGroup}>
            <label>Username</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your unique username"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Password</label>
            <div style={{ display: 'flex', position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <p className={styles.toggleText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;