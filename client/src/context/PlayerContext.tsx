import React, { createContext, useContext, useState, useEffect } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Track } from "@shared/schema";

// Sample tracks for initial state - in a real app, these would come from the API
const mockTracks: Track[] = [
  {
    id: 1,
    title: "Neo Tokyo",
    artist: "Cyber Synth",
    thumbnailUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
    audioUrl: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
    duration: 272,
    playCount: 0
  },
  {
    id: 2,
    title: "Midnight City Dreams",
    artist: "Sarah Johnson",
    thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
    audioUrl: "https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3",
    duration: 254,
    playCount: 0
  },
  {
    id: 3,
    title: "Neon Lights",
    artist: "Electro Vision",
    thumbnailUrl: "https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
    audioUrl: "https://assets.mixkit.co/music/preview/mixkit-urban-fashion-171.mp3",
    duration: 289,
    playCount: 0
  }
];

// Define the context type
interface PlayerContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  togglePlayPause: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  currentTime: number;
  duration: number;
  seekTo: (time: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  isShuffle: boolean;
  isRepeat: boolean;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  queue: Track[];
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: number) => void;
  playHistory: Track[];
  isFavorite: (trackId: number) => boolean;
  toggleFavorite: (trackId: number) => void;
  isPlayerExpanded: boolean;
  setIsPlayerExpanded: (expanded: boolean) => void;
  availableTracks: Track[];
}

// Create the context with default values
const PlayerContext = createContext<PlayerContextType>({
  currentTrack: null,
  setCurrentTrack: () => {},
  isPlaying: false,
  setIsPlaying: () => {},
  togglePlayPause: () => {},
  volume: 70,
  setVolume: () => {},
  currentTime: 0,
  duration: 0,
  seekTo: () => {},
  nextTrack: () => {},
  previousTrack: () => {},
  isShuffle: false,
  isRepeat: false,
  toggleShuffle: () => {},
  toggleRepeat: () => {},
  queue: [],
  addToQueue: () => {},
  removeFromQueue: () => {},
  playHistory: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  isPlayerExpanded: false,
  setIsPlayerExpanded: () => {},
  availableTracks: []
});

// Create the provider component
export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<Track[]>(mockTracks);
  
  const {
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    currentTime,
    duration,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    isShuffle,
    isRepeat,
    toggleShuffle,
    toggleRepeat,
    queue,
    addToQueue,
    removeFromQueue,
    playHistory,
    isFavorite,
    toggleFavorite
  } = useAudioPlayer();

  // Initialize queue with available tracks
  useEffect(() => {
    // In a real implementation, this would come from an API
    if (availableTracks.length > 0 && queue.length === 0) {
      availableTracks.forEach(track => addToQueue(track));
    }
  }, [availableTracks]);

  // Fetch tracks from API
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/api/tracks');
        if (response.ok) {
          const data = await response.json();
          setAvailableTracks(data);
        }
      } catch (error) {
        console.error("Failed to fetch tracks:", error);
        // Fallback to mock tracks if API fails
      }
    };

    fetchTracks();
  }, []);

  const value = {
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    togglePlayPause,
    volume,
    setVolume,
    currentTime,
    duration,
    seekTo,
    nextTrack,
    previousTrack,
    isShuffle,
    isRepeat,
    toggleShuffle,
    toggleRepeat,
    queue,
    addToQueue,
    removeFromQueue,
    playHistory,
    isFavorite,
    toggleFavorite,
    isPlayerExpanded,
    setIsPlayerExpanded,
    availableTracks
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

// Custom hook to use the player context
export const usePlayer = () => useContext(PlayerContext);
