"use client";

import { useEffect, useRef } from "react";
import { ICameraVideoTrack } from "agora-rtc-sdk-ng";

interface VideoPlayerProps {
  videoTrack: ICameraVideoTrack | null;
  className?: string;
  style?: React.CSSProperties;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoTrack,
  className = "",
  style = {},
}) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoTrack || !videoRef.current) return;

    // Play the video track in the div element
    videoTrack.play(videoRef.current);

    return () => {
      // Stop playing when component unmounts
      videoTrack.stop();
    };
  }, [videoTrack]);

  return (
    <div
      ref={videoRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        ...style,
      }}
    />
  );
};
