import { useState, useEffect, useRef } from "react";
import { Track } from "@shared/schema";

export function useAudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [favoriteList, setFavoriteList] = useState<number[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [playHistory, setPlayHistory] = useState<Track[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    
    // Get favorites from local storage
    const savedFavorites = localStorage.getItem("favoriteList");
    if (savedFavorites) {
      try {
        setFavoriteList(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Update audio source when current track changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      
      if (isPlaying) {
        audioRef.current.play().catch((e) => {
          console.error("Playback failed", e);
          setIsPlaying(false);
        });
      }
      
      // Add to play history
      setPlayHistory(prev => {
        const filtered = prev.filter(track => track.id !== currentTrack.id);
        return [currentTrack, ...filtered].slice(0, 20);
      });
      
      // Setup timeupdate event
      const handleTimeUpdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };
      
      const handleDurationChange = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
      
      const handleEnded = () => {
        if (isRepeat) {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
          }
        } else {
          nextTrack();
        }
      };
      
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("durationchange", handleDurationChange);
      audioRef.current.addEventListener("ended", handleEnded);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
          audioRef.current.removeEventListener("durationchange", handleDurationChange);
          audioRef.current.removeEventListener("ended", handleEnded);
        }
      };
    }
  }, [currentTrack, isPlaying, isRepeat]);
  
  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  // Play/Pause toggle
  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Next track
  const nextTrack = () => {
    if (!currentTrack || queue.length === 0) return;
    
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      setCurrentTrack(queue[randomIndex]);
    } else {
      const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % queue.length;
      setCurrentTrack(queue[nextIndex]);
    }
  };
  
  // Previous track
  const previousTrack = () => {
    if (!currentTrack || queue.length === 0) return;
    
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // If we're more than 3 seconds in, just restart the track
      audioRef.current.currentTime = 0;
      return;
    }
    
    if (playHistory.length > 1) {
      // Get the previous track from history (not including current)
      setCurrentTrack(playHistory[1]);
    } else {
      // Otherwise go to the end of the queue
      setCurrentTrack(queue[queue.length - 1]);
    }
  };
  
  // Toggle shuffle
  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };
  
  // Toggle repeat
  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };
  
  // Seek to position
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };
  
  // Add to queue
  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };
  
  // Remove from queue
  const removeFromQueue = (trackId: number) => {
    setQueue(prev => prev.filter(track => track.id !== trackId));
  };
  
  // Check if track is favorite
  const isFavorite = (trackId: number) => {
    return favoriteList.includes(trackId);
  };
  
  // Toggle favorite status
  const toggleFavorite = (trackId: number) => {
    setFavoriteList(prev => {
      const newList = prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId];
      
      // Save to local storage
      localStorage.setItem("favoriteList", JSON.stringify(newList));
      return newList;
    });
  };
  
  return {
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
  };
}
