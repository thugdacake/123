import { Playlist } from "@shared/schema";

interface PlaylistItemProps {
  playlist: Playlist;
  onClick?: () => void;
}

export default function PlaylistItem({ playlist, onClick }: PlaylistItemProps) {
  return (
    <div 
      className="playlist-card flex-shrink-0 w-32 cursor-pointer" 
      onClick={onClick}
    >
      <div className="playlist-cover w-32 h-32 rounded-lg bg-tokyo-darkHighlight overflow-hidden mb-2">
        <img 
          src={playlist.coverUrl || "https://via.placeholder.com/200x200"} 
          alt={playlist.name}
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="playlist-name text-sm font-medium truncate">{playlist.name}</div>
      <div className="playlist-count text-xs text-gray-400">
        {playlist.trackCount} música{playlist.trackCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
