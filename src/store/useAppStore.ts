import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, User, Camera } from '../types';

interface AppStore extends AppState {
  // Auth actions
  setUser: (user: User | null) => void;
  logout: () => void;
  
  // Camera actions
  setCameras: (cameras: Camera[]) => void;
  addCamera: (camera: Camera) => void;
  updateCamera: (id: string, camera: Partial<Camera>) => void;
  deleteCamera: (id: string) => void;
  setSelectedCamera: (camera: Camera | null) => void;
  
  // Video player actions
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      cameras: [],
      isLoading: false,
      error: null,
      selectedCamera: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,

      // Auth actions
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, selectedCamera: null }),

      // Camera actions
      setCameras: (cameras) => set({ cameras }),
      addCamera: (camera) => set((state) => ({ cameras: [...state.cameras, camera] })),
      updateCamera: (id, updatedCamera) =>
        set((state) => ({
          cameras: state.cameras.map((camera) =>
            camera.id === id ? { ...camera, ...updatedCamera } : camera
          ),
        })),
      deleteCamera: (id) =>
        set((state) => ({
          cameras: state.cameras.filter((camera) => camera.id !== id),
          selectedCamera: state.selectedCamera?.id === id ? null : state.selectedCamera,
        })),
      setSelectedCamera: (camera) => set({ selectedCamera: camera }),

      // Video player actions
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),

      // UI actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'video-management-store',
      partialize: (state) => ({
        user: state.user,
        cameras: state.cameras,
      }),
    }
  )
);