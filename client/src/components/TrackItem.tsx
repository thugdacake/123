import { Heart, MoreVertical } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { Track } from "@shared/schema";

interface TrackItemProps {
  track: Track;
  showActions?: boolean;
  onActionClick?: () => void;
}

export default function TrackItem({ 
  track, 
  showActions = true,
  onActionClick
}: TrackItemProps) {
  const { currentTrack, setCurrentTrack, isFavorite, toggleFavorite } = usePlayer();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  
  const handleTrackClick = () => {
    setCurrentTrack(track);
  };
  
  const isFavoriteTrack = isFavorite(track.id);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(track.id);
  };
  
  return (
    <div 
      className={`track-item flex items-center p-2 rounded-lg hover:bg-tokyo-darkHighlight transition cursor-pointer ${
        isCurrentTrack ? "bg-tokyo-darkHighlight bg-opacity-50" : ""
      }`}
      onClick={handleTrackClick}
    >
      <div className="track-thumbnail w-12 h-12 rounded bg-tokyo-darkHighlight overflow-hidden mr-3">
        <img 
          src={track.thumbnailUrl} 
          alt={track.title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="track-info flex-1 min-w-0">
        <div className="track-title text-sm font-medium truncate">{track.title}</div>
        <div className="track-artist text-xs text-gray-400 truncate">{track.artist}</div>
      </div>
      {showActions && (
        <div className="track-actions flex items-center space-x-1">
          <button 
            className="p-2 rounded-full hover:bg-tokyo-darkHighlight"
            onClick={handleFavoriteClick}
          >
            <Heart className={`w-4 h-4 ${isFavoriteTrack ? "text-tokyo-pink fill-tokyo-pink" : ""}`} />
          </button>
          {onActionClick && (
            <button 
              className="p-2 rounded-full hover:bg-tokyo-darkHighlight"
              onClick={(e) => {
                e.stopPropagation();
                onActionClick();
              }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
