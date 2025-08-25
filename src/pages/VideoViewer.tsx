import React from 'react';
import CameraList from '../components/VideoViewer/CameraList';
import VideoPlayer from '../components/VideoViewer/VideoPlayer';

const VideoViewer: React.FC = () => {
  return (
    <div className="h-100">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Video Viewer</h1>
        <p className="text-gray-400">Manage and view your camera feeds in real-time</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        <div className="lg:col-span-1">
          <CameraList />
        </div>
        
        <div className="lg:col-span-2">
          <VideoPlayer />
        </div>
      </div>
    </div>
  );
};

export default VideoViewer;