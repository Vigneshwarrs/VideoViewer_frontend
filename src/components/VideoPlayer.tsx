import { useLayoutEffect, useRef, useState } from "react";
import { analyticsAPI } from "../services/api"; // adjust path

interface VideoPlayerProps {
  cameraId: string;
}

export default function VideoPlayer({ cameraId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    if (!cameraId) return;

    setLoading(true);

    analyticsAPI
      .videoStatus("68ab376801264a607537a91e") // should return ArrayBuffer
      .then((response) => {
        const bufferData = response.data;
        const arrayBuffer = new Uint8Array(bufferData).buffer;
        // Wrap ArrayBuffer in Blob with correct type
        const blob = new Blob([arrayBuffer], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);
        console.log(url, "sdasd");
        setVideoUrl(url);
      })
      .catch((err) => console.error("Failed to load video:", err))
      .finally(() => setLoading(false));

    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, []);

  const handlePlay = () => {
    if (!videoRef.current) return;

    videoRef.current
      .play()
      .then(() => console.log("Video playing"))
      .catch((err) => console.warn("Video play failed:", err));
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
