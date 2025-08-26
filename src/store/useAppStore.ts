import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, User, Camera } from '../types';
import { wsService } from '../services/websocket';

interface CameraPlayback {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}


// Extend the AppStore interface
interface AppStore extends AppState {
  // Auth actions
  setUser: (user: User | null) => void;
  logout: () => void;

  // Camera actions
  setCameras: (cameras: Camera[]) => void;
  addCamera: (camera: Camera) => void;
  updateCamera: (id: string, camera: Partial<Camera>) => void;
  deleteCamera: (id: string) => void;

  // Selected cameras
  toggleSelectedCamera: (camera: Camera) => void;
  setSelectedCamera: (camera: Camera | null) => void; // single camera
  selectedCameras: Camera[];
  selectedCamera: Camera | null;

  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  playback: Record<string, CameraPlayback>;
  setPlayback: (id: string, playback: Partial<CameraPlayback>) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      cameras: [],
      isLoading: false,
      error: null,
      selectedCameras: [],
      selectedCamera: null,
      playback: {},

      // Auth actions
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, selectedCameras: [], selectedCamera: null }),

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
          selectedCameras: state.selectedCameras.filter((camera) => camera.id !== id),
          selectedCamera: state.selectedCamera?.id === id ? null : state.selectedCamera,
        })),

      toggleSelectedCamera: (camera) =>
        set((state) => {
          const isSelected = state.selectedCameras.some((c) => c["_id"] === camera["_id"]);
          const playback = state.playback[camera["_id"]] || { isPlaying: false };

          if (isSelected && playback.isPlaying) {
            // Pause current camera
            wsService.stopVideoStream(camera["_id"]);
            wsService.sendVideoAction(camera["_id"], "pause");

            return {
              selectedCameras: state.selectedCameras.filter((c) => c["_id"] !== camera["_id"]),
              playback: {
                ...state.playback,
                [camera["_id"]]: {
                  ...playback,
                  isPlaying: false,
                },
              },
            };
          } else {

            const activeCam = state.selectedCameras.find(
              (c) => state.playback[c["_id"]]?.isPlaying
            );

            if (activeCam && activeCam["_id"] !== camera["_id"]) {
              wsService.stopVideoStream(activeCam["_id"]);
              wsService.sendVideoAction(activeCam["_id"], "pause");
            }

            // Start new camera
            wsService.startVideoStream(camera["_id"]);
            wsService.sendVideoAction(camera["_id"], "play");

            return {
              selectedCameras: isSelected
                ? state.selectedCameras
                : [...state.selectedCameras, camera],
              playback: {
                ...state.playback,
                [camera["_id"]]: {
                  ...playback,
                  isPlaying: true,
                },
              },
            };
          }
        }),

      setSelectedCamera: (camera) => set({ selectedCamera: camera }),

      // UI actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setPlayback: (id, playback) =>
        set((state) => ({
          playback: {
            ...state.playback,
            [id]: {
              ...state.playback[id],
              ...playback,
            },
          },
        })),
    }),
    {
      name: 'video-management-store',
      partialize: (state) => ({
        user: state.user,
        cameras: state.cameras,
        playback: state.playback,
      }),
    }
  )
);