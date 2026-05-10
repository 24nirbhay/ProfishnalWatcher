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
  const [currentView, setCurrentView] = useState('library'); 
  const [showAuth, setShowAuth] = useState(false); // NEW: Controls if we show Landing or Auth

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        useStore.setState({ loading: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        setShowAuth(false); // Reset to hide auth form when logged out
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, fetchProfile]);

  if (loading) return <div className="loading-screen">Loading System...</div>;

  return (
    <div className={`app-container ${profile?.settings?.theme || 'dark'}`}>
      {!user ? (
        // NEW: If not logged in, show Auth if requested, otherwise show Landing Page
        showAuth ? (
          <>
            <button 
              onClick={() => setShowAuth(false)} 
              style={{ margin: '1rem', background: 'transparent', color: '#8b949e' }}
            >
              ← Back to Home
            </button>
            <Auth />
          </>
        ) : (
          <Landing onGetStarted={() => setShowAuth(true)} />
        )
      ) : (
        <div className="dashboard">
          <nav className="main-nav">
            <h2 onClick={() => setCurrentView('library')} style={{cursor: 'pointer', margin: 0}}>
              MyTracker
            </h2>
            <div className="nav-links">
              <button 
                className="text-btn" 
                onClick={() => setCurrentView('library')}
                style={{ fontWeight: currentView === 'library' ? 'bold' : 'normal' }}
              >
                Library
              </button>
              <button 
                className="text-btn" 
                onClick={() => setCurrentView('profile')}
                style={{ fontWeight: currentView === 'profile' ? 'bold' : 'normal' }}
              >
                Analytics
              </button>
              {profile?.is_admin && (
                <button 
                  className="text-btn admin-btn" 
                  onClick={() => setCurrentView('admin')}
                >
                  Admin
                </button>
              )}
              <button className="logout-btn" onClick={() => supabase.auth.signOut()}>
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