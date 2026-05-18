import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const useStore = create((set, get) => ({
  user: null,
  profile: null,
  library: { anime: [], movies: [], tv: [] },
  loading: true,

  setUser: (user) => set({ user }),

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Prevents the 406 error when a profile doesn't exist yet
        
      if (error) throw error;

      if (data) {
        // FIXED: Guarantee the library arrays always exist, even for brand new users
        const safeLibrary = data.library || { anime: [], movies: [], tv: [] };
        
        // Ensure all sub-arrays exist in case the DB object is partially empty
        safeLibrary.anime = safeLibrary.anime || [];
        safeLibrary.movies = safeLibrary.movies || safeLibrary.movie || []; // Catch legacy "movie"
        safeLibrary.tv = safeLibrary.tv || [];

        set({ profile: data, library: safeLibrary });
      } else {
        // Safe fallback if the database hasn't created the profile row yet
        set({ profile: { id: userId }, library: { anime: [], movies: [], tv: [] } });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      set({ loading: false });
    }
  },

  addMediaItem: async (type, item) => {
    const { library, user } = get();
    if (!user) return; // Prevent saving if no user is logged in

    // 1. Update the Local UI instantly
    const updatedLibrary = {
      ...library,
      [type]: [...(library[type] || []), item]
    };
    set({ library: updatedLibrary });

    // 2. Sync to Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, library: updatedLibrary }, { onConflict: 'id' });

    if (error) {
      console.error("Supabase Sync Error (Add):", error.message);
      alert("Failed to save to database: " + error.message);
    }
  },

  removeMediaItem: async (type, itemId) => {
    const { library, user } = get();
    if (!user) return;

    // 1. Update the Local UI instantly
    const updatedLibrary = {
      ...library,
      [type]: library[type].filter(item => item.id !== itemId)
    };
    set({ library: updatedLibrary });

    // 2. Sync deletion to Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, library: updatedLibrary }, { onConflict: 'id' });

    if (error) {
      console.error("Supabase Sync Error (Remove):", error.message);
      alert("Failed to delete from database: " + error.message);
    }
  },

  updateLibrary: async (newLibrary) => {
    const { user } = get();
    if (!user) return; // Prevent saving if no user is logged in

    // 1. Update the Local UI instantly with the imported JSON
    set({ library: newLibrary });

    // 2. Sync the entirely new library directly to the Supabase JSONB column
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, library: newLibrary }, { onConflict: 'id' });

    if (error) {
      console.error("Supabase Sync Error (Import):", error.message);
      alert("Failed to save imported library to database: " + error.message);
    }
  }
}));

export default useStore;