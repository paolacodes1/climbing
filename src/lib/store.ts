import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Climb } from '@/types/climb';

interface BoulderingStore {
  selectedGym: number | null;
  currentSession: Climb[];
  isOffline: boolean;
  setSelectedGym: (gymId: number) => void;
  addClimbToSession: (climb: Climb) => void;
  clearSession: () => void;
  setOfflineStatus: (offline: boolean) => void;
}

export const useBoulderingStore = create<BoulderingStore>()(
  persist(
    (set) => ({
      selectedGym: null,
      currentSession: [],
      isOffline: false,
      setSelectedGym: (gymId) => set({ selectedGym: gymId }),
      addClimbToSession: (climb) => 
        set(state => ({ 
          currentSession: [...state.currentSession, climb] 
        })),
      clearSession: () => set({ currentSession: [] }),
      setOfflineStatus: (offline) => set({ isOffline: offline }),
    }),
    {
      name: 'bouldering-storage',
    }
  )
);