
import React, { useEffect, useState } from 'react';
import useStore from './store/useStore';
import { supabase } from './supabaseClient';
import Landing from './components/Landing';
import Auth from './components/Auth';
import SearchBar from './components/SearchBar';
import LibraryGrid from './components/LibraryGrid';
import ImportExport from './components/ImportExport';
import Profile from './components/Profile';
import Admin from './components/Admin';
import './App.css';

function App() {
  const { user, setUser, fetchProfile, loading, profile } = useStore();
  const [currentView, setCurrentView] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // This function acts as the "Remember Me", fetching active sessions from LocalStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
        setCurrentView('library'); // Send to library if remembered
      } else {
        useStore.setState({ loading: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        setCurrentView('library');
      } else {
        setCurrentView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, fetchProfile]);

  if (loading) return <div className="loading-screen">Ek sec rav...</div>;

  return (
    <div className={`app-container ${profile?.settings?.theme || 'dark'}`}>
      
      {currentView === 'landing' && (
        <Landing user={user} onAction={(action) => setCurrentView(action)} />
      )}

      {currentView === 'auth' && (
        <>
          <button onClick={() => setCurrentView('landing')} className="back-btn">
            ← Back to Home
          </button>
          <Auth />
        </>
      )}

      {currentView !== 'landing' && currentView !== 'auth' && user && (
        <div className="dashboard">
          <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            {/* Clicking logo redirects to Landing Page */}
            <h2
              className="brand-title"
              onClick={() => setCurrentView('landing')}
            >
              profishnalwatcher
            </h2>
            
            {/* Hamburger Menu Toggle for Mobile */}
            <button 
              className="hamburger-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            
            {/* The gap is fixed natively using inline styles here for simplicity */}
            <div className="nav-links">
              <button 
                className="text-btn" 
                onClick={() => {
                  setCurrentView('library');
                  setMobileMenuOpen(false);
                }}
                style={{ fontWeight: currentView === 'library' ? 'bold' : 'normal', color: 'white', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Library
              </button>
              <button 
                className="text-btn" 
                onClick={() => {
                  setCurrentView('profile');
                  setMobileMenuOpen(false);
                }}
                style={{ fontWeight: currentView === 'profile' ? 'bold' : 'normal', color: 'white', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Profile
              </button>
              {profile?.is_admin && (
                <button 
                  className="text-btn admin-btn" 
                  onClick={() => setCurrentView('admin')}
                  style={{ color: '#ff0080', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Admin
                </button>
              )}
              <button className="logout-btn" onClick={() => supabase.auth.signOut()} style={{ background: '#333', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                Logout
              </button>
            </div>
          </nav>
          
          <main>
             {currentView === 'library' && (
               <>
                 <SearchBar />
                 <LibraryGrid />
                 <ImportExport />
               </>
             )}
             {currentView === 'profile' && <Profile />}
             {currentView === 'admin' && <Admin />}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;