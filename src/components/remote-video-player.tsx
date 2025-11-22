"use client";

import { useEffect, useRef } from "react";
import { IRemoteVideoTrack } from "agora-rtc-sdk-ng";

interface RemoteVideoPlayerProps {
  videoTrack: IRemoteVideoTrack | null;
  className?: string;
  style?: React.CSSProperties;
}

export const RemoteVideoPlayer: React.FC<RemoteVideoPlayerProps> = ({
  videoTrack,
  className = "",
  style = {},
}) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoTrack || !videoRef.current) return;

    // Play the remote video track in the div element
    videoTrack.play(videoRef.current);

    return () => {
      // Stop playing when component unmounts or track changes
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
