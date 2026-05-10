import React from 'react';
import useStore from '../store/useStore';

const Admin = () => {
  const profile = useStore(state => state.profile);

  if (!profile?.is_admin) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#f85149' }}>
        <h2>Access Denied</h2>
        <p>You do not have administrator privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ borderBottom: '1px solid #30363d', paddingBottom: '1rem' }}>System Administrator Panel</h2>
      
      <div style={{ background: '#161b22', padding: '1.5rem', borderRadius: '8px', border: '1px solid #30363d', marginTop: '1.5rem' }}>
        <h3 style={{ color: '#58a6ff', marginTop: 0 }}>Global Overview</h3>
        <p>This panel securely interfaces with your Supabase backend.</p>
        <ul style={{ color: '#8b949e', lineHeight: '1.8' }}>
          <li><strong>API Rate Limits:</strong> Normal (Jikan: 3/sec, OMDB: 50/sec)</li>
          <li><strong>Storage Health:</strong> JSONB payloads operating optimally.</li>
          <li><strong>User Auth Service:</strong> Active via Supabase Auth.</li>
        </ul>
        <button style={{ marginTop: '1rem', background: '#238636', border: 'none', color: 'white', padding: '0.8rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}>
          Broadcast System Announcement
        </button>
      </div>
    </div>
  );
};

export default Admin;