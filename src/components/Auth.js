import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Auth.module.css';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      }
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p>AI-enhanced tracking for your media library.</p>
        
        <form onSubmit={handleAuth} className={styles.form}>
          <input
            className={styles.input}
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className={styles.button} disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <button 
          className={styles.toggleText} 
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
        </button>
      </div>
    </div>
  );
};

export default Auth;