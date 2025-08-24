import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private readonly url: string;

  constructor() {
    this.url = 'https://marion-explore-spine-piece.trycloudflare.com';
  }

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(this.url, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Video streaming methods
  startVideoStream(cameraId: string) {
    console.log(cameraId)
    if (this.socket) {
      this.socket.emit('start-video-stream', { cameraId });
    }
  }

  stopVideoStream(cameraId: string) {
    if (this.socket) {
      this.socket.emit('stop-video-stream', { cameraId });
    }
  }

  sendVideoAction(cameraId: string, action: string, data?: any) {
    if (this.socket) {
      this.socket.emit('video-action', { cameraId, action, data });
    }
  }

  // Event listeners
  onVideoData(callback: (data: ArrayBuffer) => void) {
    if (this.socket) {
      this.socket.on('video-data', callback);
    }
  }

  onVideoStatus(callback: (status: any) => void) {
    if (this.socket) {
      this.socket.on('video-status', callback);
    }
  }

  onCameraUpdate(callback: (camera: any) => void) {
    if (this.socket) {
      this.socket.on('camera-update', callback);
    }
  }

  // Remove event listeners
  offVideoData() {
    if (this.socket) {
      this.socket.off('video-data');
    }
  }

  offVideoStatus() {
    if (this.socket) {
      this.socket.off('video-status');
    }
  }

  offCameraUpdate() {
    if (this.socket) {
      this.socket.off('camera-update');
    }
  }
}

export const wsService = new WebSocketService();