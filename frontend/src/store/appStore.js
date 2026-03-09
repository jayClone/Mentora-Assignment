import { create } from 'zustand';

export const useAppStore = create((set) => ({
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));
