import { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { wsService } from '../../services/websocket';
import {
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const {
    selectedCamera,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
  } = useAppStore();

  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

useEffect(() => {
  if (!selectedCamera || !videoRef.current) return;

  const videoElement = videoRef.current;
  const mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'; 

  if (!MediaSource.isTypeSupported(mimeType)) {
    console.error('MIME type not supported:', mimeType);
    return;
  }
  
  const mediaSource = new MediaSource();
  mediaSourceRef.current = mediaSource;
  videoElement.src = URL.createObjectURL(mediaSource);

  const handleSourceOpen = () => {
    console.log('MediaSource is open, adding SourceBuffer...');
    try {
      const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
      sourceBufferRef.current = sourceBuffer;

      const handleVideoData = (chunk: ArrayBuffer) => {
        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
          try {
            sourceBuffer.appendBuffer(chunk);
          } catch (err) {
            console.error('Failed to append buffer', err);
          }
        }
      };
      
      wsService.onVideoData(handleVideoData);

      videoElement.addEventListener('canplay', () => {
        if (isPlaying && videoElement.paused) {
          videoElement.play().catch(e => console.error('Play failed:', e));
        }
      });

      // Listen for buffer updates to play/pause the video
      sourceBuffer.addEventListener('updateend', () => {
        if (isPlaying && videoElement.paused) {
          videoElement.play().catch(e => console.error('Play failed:', e));
        }
      });

    } catch (error) {
      console.error('Failed to add SourceBuffer:', error);
    }
  };

  mediaSource.addEventListener('sourceopen', handleSourceOpen);
  
  wsService.onVideoStatus((status) => {
    if (status.duration) {
      setDuration(status.duration);
    }
    if (status.currentTime !== undefined) {
      setCurrentTime(status.currentTime);
    }
  });

  return () => {
    // Correct and safe cleanup
    wsService.offVideoData();
    wsService.offVideoStatus();
    
    if (videoElement.src) {
      URL.revokeObjectURL(videoElement.src);
      videoElement.src = '';
    }

    if (mediaSourceRef.current) {
      mediaSourceRef.current.removeEventListener('sourceopen', handleSourceOpen);
      if (mediaSourceRef.current.readyState === 'open') {
        mediaSourceRef.current.endOfStream();
      }
    }
  };
}, [selectedCamera, setCurrentTime, setDuration, isPlaying]);

const handlePlayPause = () => {
    if (!selectedCamera) return;

    if (isPlaying) {
      wsService.sendVideoAction(selectedCamera.id, 'pause');
      setIsPlaying(false);
    } else {
      wsService.sendVideoAction(selectedCamera.id, 'play');
      setIsPlaying(true);
    }
    
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedCamera || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    setCurrentTime(newTime);
    wsService.sendVideoAction(selectedCamera.id, 'seek', { time: newTime });
  };

  const handleSkip = (seconds: number) => {
    if (!selectedCamera) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    wsService.sendVideoAction(selectedCamera.id, 'seek', { time: newTime });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!selectedCamera) {
    return (
      <div className="h-full bg-gray-900/50 rounded-xl border border-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
            <PlayIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-400 text-lg font-medium">Select a camera to start viewing</p>
          <p className="text-gray-500 text-sm mt-2">Choose a camera from the left panel and click play</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative h-full bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}

        className="w-full h-full object-contain"
      />

      {/* Loading Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="animate-pulse-slow">
              <PlayIcon className="h-12 w-12 text-white mx-auto mb-2" />
            </div>
            <p className="text-white font-medium">{selectedCamera.name}</p>
            <p className="text-gray-300 text-sm">Ready to play</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={clsx(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 transition-all duration-300',
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        )}
      >
        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-primary-500 rounded-full relative"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="h-6 w-6" />
              ) : (
                <PlayIcon className="h-6 w-6" />
              )}
            </button>

            {/* Skip Backward */}
            <button
              onClick={() => handleSkip(-10)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <BackwardIcon className="h-5 w-5" />
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => handleSkip(10)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <ForwardIcon className="h-5 w-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMuteToggle}
                className="p-1 text-white hover:bg-white/20 rounded transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <SpeakerXMarkIcon className="h-5 w-5" />
                ) : (
                  <SpeakerWaveIcon className="h-5 w-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Time Display */}
            <div className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Camera Info */}
            <div className="text-white text-sm">
              <span className="font-medium">{selectedCamera.name}</span>
              <span className="text-gray-300 ml-2">{selectedCamera.resolution}</span>
            </div>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowsPointingOutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;