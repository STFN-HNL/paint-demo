import React, { forwardRef } from "react";
import { ConnectionQuality } from "@heygen/streaming-avatar";

import { useConnectionQuality } from "../logic/useConnectionQuality";
import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { StreamingAvatarSessionState } from "../logic";
import { CloseIcon } from "../Icons";
import { Button } from "../Button";

export const AvatarVideo = forwardRef<HTMLVideoElement>(({}, ref) => {
  const { sessionState, stopAvatar } = useStreamingAvatarSession();
  const { connectionQuality } = useConnectionQuality();

  const isLoaded = sessionState === StreamingAvatarSessionState.CONNECTED;

  return (
    <div className="w-full h-full bg-white relative">
      {connectionQuality !== ConnectionQuality.UNKNOWN && (
        <div className="absolute top-2 left-2 bg-black text-white rounded px-2 py-1 text-xs z-20">
          Connection: {connectionQuality}
        </div>
      )}
      {isLoaded && (
        <Button
          className="absolute top-2 right-2 !p-2 bg-zinc-700 bg-opacity-75 z-20 text-xs"
          onClick={stopAvatar}
        >
          <CloseIcon />
        </Button>
      )}
      <video
        ref={ref}
        autoPlay
        playsInline
        className="w-full h-full object-contain bg-white"
      >
        <track kind="captions" />
      </video>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white text-lg">
          Loading...
        </div>
      )}
    </div>
  );
});
AvatarVideo.displayName = "AvatarVideo";
