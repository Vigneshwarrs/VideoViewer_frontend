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
import { Camera } from '../../types';

interface VideoPlayerProps {
  camera: Camera;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ camera }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const { playback, setPlayback } = useAppStore();
  const camPlayback = playback[camera["_id"]] || {};

  // Use local state for each video player instance
  const isPlaying = camPlayback.isPlaying || false;
  const currentTime = camPlayback.currentTime || 0;
  const duration = camPlayback.duration || 0;

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to handle video playback based on camera prop
  useEffect(() => {
    if (!camera || !videoRef.current) return;

    const videoElement = videoRef.current;
    setIsLoading(true);
    const chunks: any[] = [];
    const handleVideo = (chunk: any) => {
        console.log(chunk,  "SDFserwer")
        chunks.push(chunk.data);

    }
  const handleStatus = (status: any) => {
    if (status.cameraId === camera["_id"] && status.message === "Stream ended") {
      const blob = new Blob(chunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      videoElement.src = url;
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    }
  };

    wsService.onVideoData(handleVideo);
    wsService.onVideoStatus(handleStatus);
    
   
    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded successfully.");
      setIsLoading(false);
      setPlayback(camera["_id"], {"duration": videoElement.duration});
    };

    const handleTimeUpdate = () => setPlayback(camera["_id"], {"currentTime": videoElement.currentTime});
    const handleDurationChange = () => setPlayback(camera["_id"], {"duration": videoElement.duration});
    const handlePlay = () => setPlayback(camera["_id"], {"isPlaying": true});
    const handlePause = () => setPlayback(camera["_id"], {"isPlaying": false});

    // Attach listeners
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("durationchange", handleDurationChange);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);

    // Cleanup
    return () => {
      wsService.offVideoData();
      wsService.offVideoStatus();
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("durationchange", handleDurationChange);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      videoElement.pause();
      videoElement.src = "";
      videoElement.load();
    };
  }, [camera]);

  // Apply volume and mute settings
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);


  const handlePlayPause = async () => {
    if (!camera || !videoRef.current) return;

    const videoElement = videoRef.current;

    if (isPlaying) {
      videoElement.pause();
      setPlayback(camera["_id"], { isPlaying: false });
      wsService.sendVideoAction(camera["_id"], 'pause');
    } else {
      try {
        await videoElement.play();
        setPlayback(camera["_id"], { isPlaying: true });
        wsService.sendVideoAction(camera["_id"], 'play');
      } catch (playError) {
        console.error('Play failed:', playError);
        if (playError.name === 'NotAllowedError') {
          setError('Please interact with the page first to enable autoplay');
        }
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!camera || !progressRef.current || !videoRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    videoRef.current.currentTime = newTime;
    setPlayback(camera["_id"], { currentTime: newTime });
    wsService.sendVideoAction(camera["_id"], 'seek', { time: newTime });
  };

  const handleSkip = (seconds: number) => {
    if (!camera || !videoRef.current) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setPlayback(camera["_id"], { currentTime: newTime });
    wsService.sendVideoAction(camera["_id"], 'skip', { time: newTime });
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
      }).catch(err => {
        console.error('Fullscreen failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Exit fullscreen failed:', err);
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
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
  };

  return (
    <div
      className="relative h-full bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
        autoPlay={isPlaying}
      />

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center max-w-md p-6">
            <div className="h-16 w-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-white font-medium mb-2">Video Error</p>
            <p className="text-gray-300 text-sm mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white font-medium">{camera.name}</p>
            <p className="text-gray-300 text-sm">Loading video stream...</p>
          </div>
        </div>
      )}

      {/* Ready to Play Overlay */}
      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <button
              onClick={handlePlayPause}
              className="h-20 w-20 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center transition-colors mb-4"
            >
              <PlayIcon className="h-10 w-10 text-white ml-1" />
            </button>
            <p className="text-white font-medium">{camera.name}</p>
            <p className="text-gray-300 text-sm">Click to start playback</p>
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
          className="w-full h-1 bg-gray-500/30 rounded-full mb-4 cursor-pointer relative group/progress"
          onClick={handleSeek}
        >
          {/* Progress bar fill */}
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-160"
            style={{
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
            }}
          />

          {/* Always visible playhead dot */}
          <div
            className="absolute top-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg transition-all duration-200 ease-linear"
            style={{
              left: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Hover-only helper dot */}
          <div
            className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{
              left: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>



        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              disabled={isLoading || !!error}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isLoading || !!error}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BackwardIcon className="h-5 w-5" />
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => handleSkip(10)}
              disabled={isLoading || !!error}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
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
              <span className="font-medium">{camera.name}</span>
              <span className="text-gray-300 ml-2">{camera.resolution}</span>
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