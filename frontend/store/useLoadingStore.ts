import { create } from "zustand";

type LoadingState = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
  loading: true,
  setLoading: (loading) => set({ loading }),
}));
