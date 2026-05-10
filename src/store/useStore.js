import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const useStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  library: {
    anime: [],
    movies: [],
    tv: []
  },

  setUser: (user) => set({ user }),
  
  fetchProfile: async (userId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        set({ 
          profile: data, 
          library: data.library || { anime: [], movies: [], tv: [] },
          loading: false 
        });
      } else {
        const newProfile = {
          id: userId,
          library: { anime: [], movies: [], tv: [] },
          settings: { theme: 'dark', public: true }
        };
        const { error: insertError } = await supabase.from('profiles').insert(newProfile);
        if (insertError) throw insertError;
        set({ profile: newProfile, library: newProfile.library, loading: false });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateLibrary: async (newLibrary) => {
    const { user } = get();
    if (!user) return;
    set({ library: newLibrary });
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ library: newLibrary, updated_at: new Date() })
        .eq('id', user.id);
      if (error) throw error;
    } catch (err) {
      console.error("Sync failed:", err.message);
      set({ error: "Failed to sync library." });
    }
  },

  // NEW: Update Profile Settings (e.g., Theme)
  updateProfile: async (newSettings) => {
    const { user, profile } = get();
    if (!user) return;
    
    const updatedProfile = { ...profile, settings: newSettings };
    set({ profile: updatedProfile });
    
    try {
      await supabase
        .from('profiles')
        .update({ settings: newSettings })
        .eq('id', user.id);
    } catch (err) {
      console.error("Failed to sync profile settings", err);
    }
  },

  addMediaItem: (type, item) => {
    const { library, updateLibrary } = get();
    const updatedList = [...library[type], item];
    updateLibrary({ ...library, [type]: updatedList });
  },

  removeMediaItem: (type, id) => {
    const { library, updateLibrary } = get();
    const updatedList = library[type].filter(item => item.id !== id);
    updateLibrary({ ...library, [type]: updatedList });
  }
}));

export default useStore;