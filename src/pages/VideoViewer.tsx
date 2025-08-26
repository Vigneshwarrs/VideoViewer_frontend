import React, { use } from 'react';
import CameraList from '../components/VideoViewer/CameraList';
import VideoPlayer from '../components/VideoViewer/VideoPlayer';
import { useAppStore } from '../store/useAppStore';
import { clsx } from 'clsx';

const VideoViewer: React.FC = () => {
  const {selectedCameras} = useAppStore();

  let gridColsClass = 'grid-cols-1';
  if (selectedCameras.length > 1) {
    gridColsClass = 'grid-cols-2';
  }
  if (selectedCameras.length > 4) {
    gridColsClass = 'grid-cols-3';
  }
  if (selectedCameras.length > 9) {
    gridColsClass = 'grid-cols-4';
  }



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
          {selectedCameras.length === 0 ? (
            <div className="h-full bg-gray-900/50 rounded-xl border border-gray-800 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-lg font-medium">Select one or more cameras to view</p>
                <p className="text-gray-500 text-sm mt-2">Add cameras from the left panel to start viewing feeds in a grid.</p>
              </div>
            </div>
          ) : (
            <div className={clsx(
              'grid h-full gap-4',
              gridColsClass
            )}>
              {selectedCameras.map((camera) => (
                <VideoPlayer key={camera.videoUrl} camera={camera} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoViewer;