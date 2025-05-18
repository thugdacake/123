import { ChevronUp, Play, Pause } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

interface MiniPlayerProps {
  onExpand: () => void;
}

export default function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause
  } = usePlayer();
  
  if (!currentTrack) return null;
  
  return (
    <div className="mini-player flex items-center p-3 border-b border-tokyo-darkHighlight">
      <div className="track-info flex-1 flex items-center min-w-0">
        <div className="track-thumbnail w-12 h-12 rounded-md bg-tokyo-darkHighlight overflow-hidden mr-3">
          <img 
            src={currentTrack.thumbnailUrl} 
            alt={currentTrack.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="track-details flex-1 min-w-0">
          <div id="current-title" className="track-title text-sm font-medium truncate">
            {currentTrack.title}
          </div>
          <div id="current-artist" className="track-artist text-xs text-gray-400 truncate">
            {currentTrack.artist}
          </div>
        </div>
      </div>
      <div className="player-controls flex items-center gap-3">
        <button 
          id="player-toggle" 
          className="btn-icon w-8 h-8 rounded-full flex items-center justify-center bg-tokyo-darkHighlight"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-tokyo-pink" />
          ) : (
            <Play className="w-4 h-4 text-tokyo-pink" />
          )}
        </button>
        <button 
          id="expand-player" 
          className="btn-icon w-8 h-8 rounded-full flex items-center justify-center bg-tokyo-darkHighlight"
          onClick={onExpand}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
