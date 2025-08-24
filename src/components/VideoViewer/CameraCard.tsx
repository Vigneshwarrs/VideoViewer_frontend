import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { cameraAPI } from '../../services/api';
import { Camera } from '../../types';
import { wsService } from '../../services/websocket';
import {
  PlayIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface CameraCardProps {
  camera: Camera;
  onEdit?: (camera: Camera) => void;
  onRefresh: () => void;
}

const CameraCard: React.FC<CameraCardProps> = ({ camera, onEdit, onRefresh }) => {
  const {
    selectedCamera,
    setSelectedCamera,
    isPlaying,
    setIsPlaying,
    user,
    deleteCamera,
  } = useAppStore();

  const isSelected = selectedCamera?.id === camera["_id"];
  const isAdmin = user?.role === 'admin';

  const handlePlay = () => {
try{
      if (isSelected && isPlaying) {
      // Pause current camera
      wsService.stopVideoStream(camera["_id"]);
      setIsPlaying(false);
      wsService.sendVideoAction(camera["_id"], 'pause');
    } else {
      // Play this camera
      if (selectedCamera && selectedCamera.id !== camera["_id"]) {
        // Stop previous camera
        wsService.stopVideoStream(selectedCamera.id);
      }
      
      setSelectedCamera({...camera, id: camera["_id"]});
      wsService.startVideoStream(camera["_id"]);
      console.log(camera["_id"])
      console.log(wsService.startVideoStream(camera["_id"]));
      setIsPlaying(true);
      wsService.sendVideoAction(camera["_id"], 'play');
    }
}catch(err) {
  console.log("web error",err);
}
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${camera.name}?`)) {
      try {
        await cameraAPI.deleteCamera(camera["_id"]);
        deleteCamera(camera["_id"]);
        onRefresh();
      } catch (error) {
        console.error('Failed to delete camera:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-400';
      case 'offline':
        return 'text-red-400';
      case 'maintenance':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/20 border-green-500/30';
      case 'offline':
        return 'bg-red-500/20 border-red-500/30';
      case 'maintenance':
        return 'bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div
      className={clsx(
        'bg-gray-800/50 backdrop-blur-sm rounded-xl border transition-all duration-200 hover:bg-gray-800/70',
        isSelected
          ? 'border-primary-500 shadow-lg shadow-primary-500/20'
          : 'border-gray-700 hover:border-gray-600'
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{camera.name}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">{camera.description}</p>
          </div>
          
          <div className={clsx('px-2 py-1 rounded-full border text-xs font-medium', getStatusBg(camera.status))}>
            <div className="flex items-center space-x-1">
              <SignalIcon className={clsx('h-3 w-3', getStatusColor(camera.status))} />
              <span className={getStatusColor(camera.status)}>
                {camera.status.charAt(0).toUpperCase() + camera.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center text-xs text-gray-400 mb-3">
          <MapPinIcon className="h-3 w-3 mr-1" />
          {camera.location}
          <span className="ml-4">{camera.resolution} • {camera.frameRate}fps</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlay}
            disabled={camera.status === 'offline'}
            className={clsx(
              'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              camera.status === 'offline'
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : isSelected && isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            )}
          >
            {isSelected && isPlaying ? (
              <>
                <PauseIcon className="h-4 w-4 mr-1" />
                Stop
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-1" />
                Play
              </>
            )}
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => onEdit?.(camera)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCard;