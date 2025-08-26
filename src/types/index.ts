export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Camera {
  id: string;
  name: string;
  description: string;
  location: string;
  videoUrl: string;
  videoFile?: File;
  status: 'online' | 'offline' | 'maintenance';
  resolution: string;
  frameRate: number;
  isRecording: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface VideoSession {
  id: string;
  cameraId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  actions: VideoAction[];
}

export interface VideoAction {
  id: string;
  sessionId: string;
  action: 'play' | 'pause' | 'forward' | 'backward' | 'seek';
  timestamp: Date;
  position?: number;
}

export interface LoginActivity {
  id: string;
  userId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

export interface CameraActivity {
  id: string;
  cameraId: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'play';
  timestamp: Date;
  details: Record<string, any>;
}

export interface AnalyticsData {
  totalCameras: number;
  activeSessions: number;
  totalUsers: number;
  cameraUsage: {
    cameraId: string;
    cameraName: string;
    playCount: number;
    totalDuration: number;
  }[];
  loginActivity: {
    date: string;
    count: number;
  }[];
  mostActiveUsers: {
    userId: string;
    username: string;
    activityCount: number;
  }[];
}

export interface AppState {
  user: User | null;
  cameras: Camera[];
  isLoading: boolean;
  error: string | null;
  selectedCamera: Camera | null;
}