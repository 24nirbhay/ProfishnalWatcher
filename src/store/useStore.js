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
        .single();
        
      if (error) throw error;
      if (data) {
        set({ profile: data, library: data.library });
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

    // 1. Update the Local UI instantly (Optimistic Update)
    const updatedLibrary = {
      ...library,
      [type]: [...(library[type] || []), item]
    };
    set({ library: updatedLibrary });

    // 2. Sync the new library directly to the Supabase JSONB column
    const { error } = await supabase
      .from('profiles')
      .update({ library: updatedLibrary })
      .eq('id', user.id);

    // 3. Catch and alert any database rejections
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

    // 2. Sync the deletion to Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ library: updatedLibrary })
      .eq('id', user.id);

    if (error) {
      console.error("Supabase Sync Error (Remove):", error.message);
      alert("Failed to delete from database: " + error.message);
    }
  },
  // Add this right below removeMediaItem
  updateLibrary: async (newLibrary) => {
    const { user } = get();
    if (!user) return; // Prevent saving if no user is logged in

    // 1. Update the Local UI instantly (Optimistic Update)
    set({ library: newLibrary });

    // 2. Sync the entirely new library directly to the Supabase JSONB column
    const { error } = await supabase
      .from('profiles')
      .update({ library: newLibrary })
      .eq('id', user.id);

    // 3. Catch and alert any database rejections
    if (error) {
      console.error("Supabase Sync Error (Import):", error.message);
      alert("Failed to save imported library to database: " + error.message);
    }
  }
}));

export default useStore;