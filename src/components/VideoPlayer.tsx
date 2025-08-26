import { useRef, useState } from "react";
import { wsService } from "../services/websocket";

interface VideoPlayerProps {
  cameraId: string;
}

export default function VideoPlayer({ cameraId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  
  const chunks: any[] = [];
    const handleVideo = (chunk: any) => {
        chunks.push(chunk.data);
    }


  const handlePlay = () => {
    if (!videoRef.current) return;
    wsService.startVideoStream(cameraId);
    wsService.onVideoData(handleVideo);

    wsService.onVideoStatus((status: any) => {
    if (status.message === "Stream ended") {
        console.log(chunks);
      const blob = new Blob(chunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);

      if (videoRef.current) {
        videoRef.current.src = url;
        // videoRef.current.play();
      }
    }
  });
  };

  return (
    <div>
      {loading && <p>Loading video...</p>}

      <button
        onClick={handlePlay}
        style={{
          marginBottom: "10px",
          backgroundColor: "red",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Play Video
      </button>

      <video
        ref={videoRef}
        controls
        width={640}
        src={videoUrl || undefined}
        // preload="auto"
      />
    </div>
  );
}