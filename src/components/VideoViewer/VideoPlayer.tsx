import { useRef, useEffect, useState, useLayoutEffect } from 'react';
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
import { analyticsAPI } from '../../services/api';

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

  // const mediaSourceRef = useRef<MediaSource | null>(null);
  // const sourceBufferRef = useRef<SourceBuffer | null>(null);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video streaming implementation
  // useEffect(() => {
  //   if (!selectedCamera || !videoRef.current) return;

  //   const videoElement = videoRef.current;
  //   let mediaSource: MediaSource;
  //   let sourceBuffer: SourceBuffer;
  //   let chunksQueue: ArrayBuffer[] = [];
  //   let isProcessing = false;
  //   let isInitialized = false;

  //   setIsLoading(true);
  //   setError(null);

  //   const initializeMediaSource = () => {
  //     mediaSource = new MediaSource();
  //     mediaSourceRef.current = mediaSource;

  //     const handleSourceOpen = () => {
  //       console.log('📺 MediaSource opened, readyState:', mediaSource.readyState);

  //       try {
  //         // Test MIME types in order of preference
  //         const mimeTypes = [
  //           'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
  //           'video/mp4; codecs="avc1.42E01E"',
  //           'video/mp4; codecs="avc1.64001E"',
  //           'video/mp4',
  //           'video/webm; codecs="vp8, vorbis"',
  //           'video/webm; codecs="vp9, opus"',
  //           'video/webm'
  //         ];

  //         let selectedMimeType = '';
  //         console.log('Testing MIME type support:');

  //         for (const mimeType of mimeTypes) {
  //           const isSupported = MediaSource.isTypeSupported(mimeType);
  //           console.log(`- ${mimeType}: ${isSupported ? 'true' : 'false'}`);

  //           if (isSupported && !selectedMimeType) {
  //             selectedMimeType = mimeType;
  //           }
  //         }

  //         if (!selectedMimeType) {
  //           const errorMsg = 'No supported video format found. Your browser may not support MSE.';
  //           console.error('Error:', errorMsg);
  //           setError(errorMsg);
  //           return;
  //         }

  //         console.log('Using MIME type:', selectedMimeType);

  //         sourceBuffer = mediaSource.addSourceBuffer(selectedMimeType);
  //         sourceBufferRef.current = sourceBuffer;

  //         // SourceBuffer event handlers
  //         sourceBuffer.addEventListener('updatestart', () => {
  //           console.log('SourceBuffer update started');
  //         });

  //         sourceBuffer.addEventListener('updateend', () => {
  //           console.log('SourceBuffer update ended');
  //           isProcessing = false;

  //           // Log buffer state
  //           if (sourceBuffer.buffered.length > 0) {
  //             const bufferedStart = sourceBuffer.buffered.start(0);
  //             const bufferedEnd = sourceBuffer.buffered.end(0);
  //             console.log(`Buffered: ${bufferedStart.toFixed(2)}s - ${bufferedEnd.toFixed(2)}s`);
  //           }

  //           // Process next chunk
  //           processChunkQueue();

  //           // Try to play if conditions are met
  //           if (isPlaying && videoElement.paused && videoElement.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
  //             console.log('Attempting to play video...');
  //             videoElement.play().catch(e => {
  //               console.error('Play failed:', e);
  //               if (e.name === 'NotAllowedError') {
  //                 console.log('User interaction required for autoplay');
  //               }
  //             });
  //           }
  //         });

  //         sourceBuffer.addEventListener('error', (e) => {
  //           console.error('SourceBuffer error:', e);
  //           setError('Video buffer error occurred');
  //           isProcessing = false;
  //         });

  //         sourceBuffer.addEventListener('abort', (e) => {
  //           console.log('SourceBuffer operation aborted:', e);
  //           isProcessing = false;
  //         });

  //         // Start listening for video data
  //         setupVideoDataListener();
  //         isInitialized = true;

  //       } catch (error) {
  //         console.error('Failed to create SourceBuffer:', error);
  //         setError(`Failed to initialize video: ${error.message}`);
  //       }
  //     };

  //     mediaSource.addEventListener('sourceopen', handleSourceOpen);

  //     mediaSource.addEventListener('sourceended', () => {
  //       console.log('MediaSource ended');
  //     });

  //     mediaSource.addEventListener('sourceclose', () => {
  //       console.log('MediaSource closed');
  //     });

  //     mediaSource.addEventListener('error', (e) => {
  //       console.error('MediaSource error:', e);
  //       setError('Media source error occurred');
  //     });

  //     // Set video source
  //     const objectURL = URL.createObjectURL(mediaSource);
  //     videoElement.src = objectURL;
  //     console.log('Video source set');
  //   };

  //   const processChunkQueue = () => {
  //     if (!isInitialized || isProcessing || !sourceBuffer || sourceBuffer.updating || chunksQueue.length === 0) {
  //       return;
  //     }

  //     if (mediaSource.readyState !== 'open') {
  //       console.log('MediaSource not open, current state:', mediaSource.readyState);
  //       return;
  //     }

  //     isProcessing = true;
  //     const chunk = chunksQueue.shift();

  //     if (chunk) {
  //       try {
  //         console.log('Appending chunk:', chunk.byteLength, 'bytes');

  //         // Debug chunk header
  //         const uint8View = new Uint8Array(chunk);
  //         const header = Array.from(uint8View.slice(0, 16))
  //           .map(b => b.toString(16).padStart(2, '0'))
  //           .join(' ');
  //         console.log('Chunk header:', header);

  //         // Check for video format markers
  //         if (uint8View[0] === 0x00 && uint8View[1] === 0x00 && uint8View[2] === 0x00 && uint8View[3] === 0x01) {
  //           console.log('H.264 NAL unit detected');
  //         } else if (uint8View[4] === 0x66 && uint8View[5] === 0x74 && uint8View[6] === 0x79 && uint8View[7] === 0x70) {
  //           console.log('MP4 ftyp box detected');
  //         } else {
  //           console.log('Unknown chunk format - may cause decode errors');
  //         }

  //         // Append buffer directly (chunk is already ArrayBuffer)
  //         sourceBuffer.appendBuffer(chunk);

  //       } catch (error: any) {
  //         console.error('Error appending buffer:', error);
  //         isProcessing = false;

  //         if (error.name === 'QuotaExceededError') {
  //           console.log('Buffer quota exceeded, cleaning up...');
  //           handleQuotaExceeded();
  //         } else if (error.name === 'InvalidStateError') {
  //           console.log('Invalid state, retrying...');
  //           setTimeout(() => {
  //             isProcessing = false;
  //             processChunkQueue();
  //           }, 100);
  //         } else {
  //           setError(`Video decode error: ${error.message}`);
  //         }
  //       }
  //     } else {
  //       isProcessing = false;
  //     }
  //   };

  //   const handleQuotaExceeded = () => {
  //     if (!sourceBuffer || sourceBuffer.buffered.length === 0) return;

  //     try {
  //       const currentTime = videoElement.currentTime;
  //       const bufferStart = sourceBuffer.buffered.start(0);
  //       const bufferEnd = sourceBuffer.buffered.end(0);

  //       console.log(`Buffer: ${bufferStart.toFixed(2)}s-${bufferEnd.toFixed(2)}s, playing: ${currentTime.toFixed(2)}s`);

  //       // Remove old data (keep last 30 seconds from current position)
  //       const removeEnd = Math.max(bufferStart, currentTime - 30);

  //       if (removeEnd > bufferStart) {
  //         console.log(`Removing buffer: ${bufferStart.toFixed(2)}s-${removeEnd.toFixed(2)}s`);
  //         sourceBuffer.remove(bufferStart, removeEnd);
  //       }
  //     } catch (removeError) {
  //       console.error('Error removing buffer:', removeError);
  //     }
  //   };

  //   const setupVideoDataListener = () => {
  //     const handleVideoData = (chunk: any) => {
  //       chunk = new Uint8Array(chunk);
  //       console.log("Received video chunk:", chunk.byteLength, "bytes");

  //       // Add to queue (chunk is already ArrayBuffer)
  //       chunksQueue.push(chunk);

  //       // Start processing if not already doing so
  //       if (!isProcessing) {
  //         setTimeout(processChunkQueue, 0);
  //       }
  //     };

  //     wsService.onVideoData(handleVideoData);
  //   };

  //   const setupVideoEvents = () => {
  //     videoElement.addEventListener('loadstart', () => {
  //       console.log('Video loading started');
  //       setIsLoading(true);
  //     });

  //     videoElement.addEventListener('loadedmetadata', () => {
  //       console.log('Video metadata loaded');
  //       console.log(`- Duration: ${videoElement.duration}s`);
  //       console.log(`- Dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
  //       setIsLoading(false);
  //     });

  //     videoElement.addEventListener('loadeddata', () => {
  //       console.log('Video data loaded');
  //       setIsLoading(false);
  //     });

  //     videoElement.addEventListener('canplay', () => {
  //       console.log('▶Video can start playing');
  //       setIsLoading(false);

  //       if (isPlaying && videoElement.paused) {
  //         videoElement.play().catch(e => console.error('Play failed:', e));
  //       }
  //     });

  //     videoElement.addEventListener('canplaythrough', () => {
  //       console.log('Video can play through');
  //       setIsLoading(false);
  //     });

  //     videoElement.addEventListener('playing', () => {
  //       console.log('▶Video started playing');
  //       setIsLoading(false);
  //     });

  //     videoElement.addEventListener('waiting', () => {
  //       console.log('Video waiting for data');
  //       setIsLoading(true);
  //     });

  //     videoElement.addEventListener('stalled', () => {
  //       console.log('Video download stalled');
  //     });

  //     videoElement.addEventListener('error', (e) => {
  //       console.error('Video element error:', e);

  //       if (videoElement.error) {
  //         const errorCode = videoElement.error.code;
  //         const errorMessages = {
  //           1: 'Media loading aborted',
  //           2: 'Network error',
  //           3: 'Media decode failed - invalid format or corrupted data',
  //           4: 'Media format not supported'
  //         };

  //         const errorMsg = errorMessages[errorCode as keyof typeof errorMessages] || 'Unknown video error';
  //         console.error(`Video error (${errorCode}):`, errorMsg);
  //         setError(errorMsg);
  //       }

  //       setIsLoading(false);
  //     });

  //     videoElement.addEventListener('timeupdate', () => {
  //       if (!isNaN(videoElement.currentTime)) {
  //         setCurrentTime(videoElement.currentTime);
  //       }
  //     });

  //     videoElement.addEventListener('durationchange', () => {
  //       if (!isNaN(videoElement.duration) && isFinite(videoElement.duration)) {
  //         setDuration(videoElement.duration);
  //       }
  //     });

  //     videoElement.addEventListener('progress', () => {
  //       if (videoElement.buffered.length > 0) {
  //         const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
  //         console.log(`Video buffered: ${bufferedEnd.toFixed(2)}s`);
  //       }
  //     });
  //   };

  //   // Initialize everything
  //   initializeMediaSource();
  //   setupVideoEvents();

  //   // Setup video status listener
  //   wsService.onVideoStatus((status) => {
  //     if (status.duration) {
  //       setDuration(status.duration);
  //     }
  //     if (status.currentTime !== undefined) {
  //       setCurrentTime(status.currentTime);
  //     }
  //   });

  //   // Cleanup function
  //   return () => {
  //     console.log('Cleaning up video stream...');

  //     // Clear state
  //     chunksQueue = [];
  //     isProcessing = false;
  //     isInitialized = false;

  //     // Remove WebSocket listeners
  //     wsService.offVideoData();
  //     wsService.offVideoStatus();

  //     // Clean up video element
  //     if (videoElement.src) {
  //       URL.revokeObjectURL(videoElement.src);
  //       videoElement.src = '';
  //       videoElement.load(); // Reset video element
  //     }

  //     // Clean up MediaSource
  //     if (mediaSource) {
  //       try {
  //         if (sourceBuffer && mediaSource.readyState === 'open' && !sourceBuffer.updating) {
  //           mediaSource.removeSourceBuffer(sourceBuffer);
  //         }
  //         if (mediaSource.readyState === 'open') {
  //           mediaSource.endOfStream();
  //         }
  //       } catch (cleanupError) {
  //         console.error('Error during cleanup:', cleanupError);
  //       }
  //     }

  //     // Clear refs
  //     mediaSourceRef.current = null;
  //     sourceBufferRef.current = null;

  //     // Reset state
  //     setIsLoading(true);
  //     setError(null);
  //   };
  // }, [selectedCamera, setCurrentTime, setDuration, isPlaying]);

  useLayoutEffect(() => {
    if (!selectedCamera || !videoRef.current) return;

    const videoElement = videoRef.current;
    setIsLoading(true);

    let objectUrl: string | null = null;

    analyticsAPI
      .videoStatus(selectedCamera.id)
      .then((response) => {
        const bufferData = response.data;
        const arrayBuffer = new Uint8Array(bufferData).buffer;
        const blob = new Blob([arrayBuffer], { type: "video/mp4" });
        objectUrl = URL.createObjectURL(blob);

        videoElement.src = objectUrl;
      })
      .catch((err) => console.error("Failed to load video:", err))
      .finally(() => setIsLoading(false));

    // Handlers
    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded successfully.");
      setIsLoading(false);
      setDuration(videoElement.duration);
    };

    const handleTimeUpdate = () => setCurrentTime(videoElement.currentTime);
    const handleDurationChange = () => setDuration(videoElement.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    // Attach listeners
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("durationchange", handleDurationChange);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);

    // Cleanup
    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("durationchange", handleDurationChange);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);

      videoElement.src = "";
      videoElement.load();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedCamera, setIsPlaying, setCurrentTime, setDuration]);

  // Apply volume and mute settings
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const handlePlayPause = async () => {
    if (!selectedCamera || !videoRef.current) return;

    const videoElement = videoRef.current;

    if (isPlaying) {
      await videoElement.pause();
      wsService.sendVideoAction(selectedCamera.id, 'pause');
      setIsPlaying(false);
    } else {
      try {
        await videoElement.play();
        wsService.sendVideoAction(selectedCamera.id, 'play');
        setIsPlaying(true);
      } catch (playError) {
        console.error('Play failed:', playError);
        if (playError.name === 'NotAllowedError') {
          setError('Please interact with the page first to enable autoplay');
        }
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedCamera || !progressRef.current || !videoRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    wsService.sendVideoAction(selectedCamera.id, 'seek', { time: newTime });
  };

  const handleSkip = (seconds: number) => {
    if (!selectedCamera || !videoRef.current) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current.currentTime = newTime;
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
    // The useEffect will reinitialize everything
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
            <p className="text-white font-medium">{selectedCamera.name}</p>
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
            <p className="text-white font-medium">{selectedCamera.name}</p>
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