"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ContentItem } from "@/lib/types";

interface TablePlayerProps {
  item: ContentItem;
}

export function TablePlayer({ item }: TablePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAudioContent = item.contentType === "audio";
  const isVideoContent = item.contentType === "video";
  const isPlayableContent = isAudioContent || isVideoContent;

  useEffect(() => {
    const mediaElement = isAudioContent ? audioRef.current : videoRef.current;
    if (!mediaElement || !showPlayer) return;

    const updateTime = () => setCurrentTime(mediaElement.currentTime);
    const updateDuration = () => {
      setDuration(mediaElement.duration);
      setIsLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);

    mediaElement.addEventListener("timeupdate", updateTime);
    mediaElement.addEventListener("loadedmetadata", updateDuration);
    mediaElement.addEventListener("ended", handleEnded);
    mediaElement.addEventListener("loadstart", handleLoadStart);

    return () => {
      mediaElement.removeEventListener("timeupdate", updateTime);
      mediaElement.removeEventListener("loadedmetadata", updateDuration);
      mediaElement.removeEventListener("ended", handleEnded);
      mediaElement.removeEventListener("loadstart", handleLoadStart);
    };
  }, [isAudioContent, showPlayer]);

  const togglePlayPause = async () => {
    const mediaElement = isAudioContent ? audioRef.current : videoRef.current;
    if (!mediaElement) return;

    try {
      if (isPlaying) {
        mediaElement.pause();
      } else {
        // Pause other players first
        document.querySelectorAll("audio, video").forEach((el) => {
          if (el !== mediaElement && "pause" in el) {
            (el as HTMLAudioElement | HTMLVideoElement).pause();
          }
        });
        await mediaElement.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Playback error:", error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mediaElement = isAudioContent ? audioRef.current : videoRef.current;
    if (!mediaElement) return;

    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    mediaElement.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleMute = () => {
    const mediaElement = isAudioContent ? audioRef.current : videoRef.current;
    if (!mediaElement) return;

    if (isMuted) {
      mediaElement.volume = volume;
      setIsMuted(false);
    } else {
      mediaElement.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (!time || !Number.isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  if (!isPlayableContent) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-gray-50">
          {item.contentType}
        </Badge>
        {item.contentType === "ebook" && (
          <Button size="sm" variant="ghost" asChild>
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener"
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              PDF
            </a>
          </Button>
        )}
      </div>
    );
  }

  if (!showPlayer) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={`${isAudioContent ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}
        >
          {item.contentType}
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowPlayer(true)}
          className="h-6 px-2 text-xs hover:bg-primary/10"
        >
          <Play className="w-3 h-3 mr-1" />
          Play
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      {/* Media Element */}
      {isAudioContent && (
        <audio
          ref={audioRef}
          src={item.fileUrl}
          preload="metadata"
          className="hidden"
        >
          <track kind="captions" srcLang="en" />
        </audio>
      )}

      {isVideoContent && (
        <video
          ref={videoRef}
          src={item.fileUrl}
          preload="metadata"
          className="w-full max-w-sm rounded-md bg-black"
          style={{ maxHeight: "200px" }}
        >
          <track kind="captions" srcLang="en" />
        </video>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
        <Button
          onClick={togglePlayPause}
          size="sm"
          variant="ghost"
          className="h-8 w-8 rounded-full bg-white shadow-sm hover:bg-gray-100"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3" />
          )}
        </Button>

        {/* Progress Bar */}
        <div className="flex-1 min-w-0">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercentage}%, #e5e7eb ${progressPercentage}%, #e5e7eb 100%)`
            }}
          />
        </div>

        {/* Time Display */}
        <span className="text-xs text-gray-600 min-w-[60px] text-center">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Volume Control */}
        <Button
          onClick={toggleMute}
          size="sm"
          variant="ghost"
          className="h-6 w-6"
        >
          {isMuted ? (
            <VolumeX className="w-3 h-3" />
          ) : (
            <Volume2 className="w-3 h-3" />
          )}
        </Button>

        {/* Close Player */}
        <Button
          onClick={() => {
            setShowPlayer(false);
            setIsPlaying(false);
            const mediaElement = isAudioContent
              ? audioRef.current
              : videoRef.current;
            if (mediaElement) {
              mediaElement.pause();
            }
          }}
          size="sm"
          variant="ghost"
          className="h-6 w-6 text-gray-400 hover:text-gray-600"
        >
          ×
        </Button>
      </div>
    </div>
  );
}
