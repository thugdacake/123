import { useState, useEffect } from "react";
import { 
  ChevronDown,
  Share2,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Shuffle,
  Heart,
  Sliders,
  PlusSquare,
  Bluetooth,
  Volume2
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { formatTime } from "@/lib/utils";
import WaveformVisualizer from "./WaveformVisualizer";
import { useBluetooth } from "@/context/BluetoothContext";

interface FullPlayerProps {
  isExpanded: boolean;
  onMinimize: () => void;
  onShareClick: () => void;
}

export default function FullPlayer({ 
  isExpanded, 
  onMinimize, 
  onShareClick 
}: FullPlayerProps) {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause,
    nextTrack,
    previousTrack,
    currentTime,
    duration,
    volume,
    setVolume,
    isShuffle,
    isRepeat,
    toggleShuffle,
    toggleRepeat,
    isFavorite,
    toggleFavorite
  } = usePlayer();
  
  const { connectedDevices } = useBluetooth();
  
  const [progressWidth, setProgressWidth] = useState(0);
  
  useEffect(() => {
    if (duration > 0) {
      setProgressWidth((currentTime / duration) * 100);
    } else {
      setProgressWidth(0);
    }
  }, [currentTime, duration]);
  
  if (!currentTrack) return null;
  
  return (
    <div id="full-player" className={`absolute inset-0 bg-tokyo-dark z-20 transition-transform duration-300 ${
      isExpanded ? "translate-y-0" : "translate-y-full"
    }`}>
      <div className="full-player-header flex justify-between items-center px-5 py-4">
        <button 
          id="minimize-player" 
          className="btn-icon w-9 h-9 rounded-full flex items-center justify-center bg-tokyo-darkHighlight"
          onClick={onMinimize}
        >
          <ChevronDown className="w-5 h-5" />
        </button>
        <div className="player-title font-medium">Reproduzindo</div>
        <button 
          id="share-music" 
          className="btn-icon w-9 h-9 rounded-full flex items-center justify-center bg-tokyo-darkHighlight"
          onClick={onShareClick}
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
      
      <div className="full-player-content px-6 py-4">
        <div className="full-track-thumbnail w-full aspect-square rounded-xl bg-tokyo-darkHighlight overflow-hidden mb-8 shadow-xl">
          <img 
            id="full-thumbnail" 
            src={currentTrack.thumbnailUrl} 
            alt={currentTrack.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="full-track-info mb-6 text-center">
          <div id="full-title" className="full-track-title text-xl font-semibold mb-1">
            {currentTrack.title}
          </div>
          <div id="full-artist" className="full-track-artist text-base text-gray-400">
            {currentTrack.artist}
          </div>
        </div>
        
        {/* Waveform Visualization */}
        <WaveformVisualizer isPlaying={isPlaying} progressWidth={progressWidth} />
        
        <div className="progress-container mb-6">
          <div className="progress-bar h-1 bg-gray-700 rounded-full mb-2">
            <div 
              id="progress-current" 
              className="progress-current h-full bg-tokyo-pink rounded-full" 
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>
          <div className="progress-time flex justify-between text-xs text-gray-400">
            <span id="current-time">{formatTime(currentTime)}</span>
            <span id="total-time">{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="full-player-controls flex items-center justify-between mb-8">
          <button 
            id="repeat-track" 
            className={`btn-icon w-10 h-10 rounded-full flex items-center justify-center ${
              isRepeat ? "text-tokyo-pink" : "text-gray-400"
            }`}
            onClick={toggleRepeat}
          >
            <Repeat className="w-5 h-5" />
          </button>
          <button 
            id="prev-track" 
            className="btn-icon w-10 h-10 rounded-full flex items-center justify-center"
            onClick={previousTrack}
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button 
            id="full-player-toggle" 
            className="btn-icon w-16 h-16 rounded-full flex items-center justify-center bg-tokyo-pink shadow-lg"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white" />
            )}
          </button>
          <button 
            id="next-track" 
            className="btn-icon w-10 h-10 rounded-full flex items-center justify-center"
            onClick={nextTrack}
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <button 
            id="shuffle-tracks" 
            className={`btn-icon w-10 h-10 rounded-full flex items-center justify-center ${
              isShuffle ? "text-tokyo-pink" : "text-gray-400"
            }`}
            onClick={toggleShuffle}
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="volume-container flex items-center space-x-3 mb-6">
          <Volume2 className="w-5 h-5 text-gray-400" />
          <input 
            type="range" 
            id="volume-slider" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="flex-1 h-1 bg-gray-700 rounded-full appearance-none" 
            style={{
              background: `linear-gradient(to right, hsl(var(--tokyo-pink)) 0%, hsl(var(--tokyo-pink)) ${volume}%, #4B5563 ${volume}%, #4B5563 100%)`
            }}
          />
          <span className="text-xs text-gray-400">{volume}%</span>
        </div>
        
        <div className="player-actions flex items-center justify-between">
          <button 
            id="favorite-track" 
            className="btn-icon w-12 h-12 rounded-full flex items-center justify-center bg-tokyo-darkHighlight"
            onClick={toggleFavorite}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "text-tokyo-pink fill-tokyo-pink" : ""}`} />
          </button>
          <button 
            id="equalizer-button" 
            className="btn-icon w-12 h-12 rounded-full flex items-center justify-center bg-tokyo-darkHighlight"
            onClick={() => window.location.href = "/equalizer"}
          >
            <Sliders className="w-5 h-5" />
          </button>
          <button 
            id="add-to-playlist" 
            className="btn-icon w-12 h-12 rounded-full flex items-center justify-center bg-tokyo-darkHighlight"
          >
            <PlusSquare className="w-5 h-5" />
          </button>
          <button 
            id="bluetooth-button" 
            className="btn-icon w-12 h-12 rounded-full flex items-center justify-center bg-tokyo-darkHighlight"
            onClick={() => window.location.href = "/bluetooth"}
          >
            <Bluetooth className="w-5 h-5" />
          </button>
        </div>
        
        {/* Connected Listeners */}
        {connectedDevices.length > 0 && (
          <div className="connected-listeners mt-8">
            <div className="section-header flex justify-between items-center mb-3">
              <h3 className="font-heading font-semibold text-sm">Ouvintes Conectados</h3>
              <span className="text-xs text-gray-400">{connectedDevices.length} pessoas</span>
            </div>
            <div className="listeners-avatars flex items-center">
              {connectedDevices.slice(0, 3).map((device, index) => (
                <div 
                  key={device.id}
                  className="listener-avatar w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center border-2 border-tokyo-dark"
                  style={{ marginLeft: index > 0 ? "-0.5rem" : "0" }}
                >
                  <span className="text-xs font-medium">
                    {device.name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2)}
                  </span>
                </div>
              ))}
              <button className="ml-2 px-2 py-1 rounded-full bg-tokyo-darkHighlight text-xs">
                Gerenciar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
