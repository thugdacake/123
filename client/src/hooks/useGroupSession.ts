import { useState, useCallback } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { generateSessionId } from "@/lib/utils";
import { Track } from "@shared/schema";

interface SessionMember {
  id: number;
  name: string;
  isHost: boolean;
}

interface QueuedTrack {
  track: Track;
  addedBy: number;
  votes: number;
  votedBy: number[];
}

interface Session {
  id: string;
  hostId: number;
  trackId: number | null;
  members: SessionMember[];
  queue: QueuedTrack[];
  createdAt: string;
}

export function useGroupSession() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const { currentTrack } = usePlayer();
  
  const userId = 1; // Current user ID (would normally come from auth)
  
  // Create a new session
  const createSession = useCallback((customId?: string) => {
    if (!currentTrack) return;
    
    const sessionId = customId || generateSessionId();
    
    const newSession: Session = {
      id: sessionId,
      hostId: userId,
      trackId: currentTrack.id,
      members: [
        {
          id: userId,
          name: "Você",
          isHost: true
        }
      ],
      queue: [],
      createdAt: new Date().toISOString()
    };
    
    setCurrentSession(newSession);
    
    // In a real app, we would call a server API to create the session
  }, [currentTrack, userId]);
  
  // Join an existing session
  const joinSession = useCallback((sessionId: string) => {
    // In a real app, this would be an API call
    // Here we simulate creating a session with predefined members
    
    // Simulate session lookup
    const foundSession: Session = {
      id: sessionId,
      hostId: 2, // Someone else is the host
      trackId: currentTrack?.id || null,
      members: [
        {
          id: 2,
          name: "Carlos",
          isHost: true
        },
        {
          id: 3,
          name: "Amanda",
          isHost: false
        }
      ],
      queue: [],
      createdAt: new Date().toISOString()
    };
    
    // Add current user to the members
    foundSession.members.push({
      id: userId,
      name: "Você",
      isHost: false
    });
    
    setCurrentSession(foundSession);
  }, [currentTrack, userId]);
  
  // Leave the current session
  const leaveSession = useCallback(() => {
    // In a real app, this would be an API call
    setCurrentSession(null);
  }, []);
  
  // End the session (host only)
  const endSession = useCallback(() => {
    if (!currentSession || currentSession.hostId !== userId) return;
    
    // In a real app, this would be an API call
    setCurrentSession(null);
  }, [currentSession, userId]);
  
  // Add a track to the queue
  const addTrackToQueue = useCallback((track: Track) => {
    if (!currentSession) return;
    
    setCurrentSession(prev => {
      if (!prev) return null;
      
      const newQueueItem: QueuedTrack = {
        track,
        addedBy: userId,
        votes: 1, // Auto vote by the user who added it
        votedBy: [userId]
      };
      
      return {
        ...prev,
        queue: [...prev.queue, newQueueItem]
      };
    });
  }, [currentSession, userId]);
  
  // Vote for a track in the queue
  const voteForTrack = useCallback((trackId: number) => {
    if (!currentSession) return;
    
    setCurrentSession(prev => {
      if (!prev) return null;
      
      const updatedQueue = prev.queue.map(item => {
        if (item.track.id === trackId) {
          // Check if user already voted
          if (item.votedBy.includes(userId)) {
            // Remove vote
            return {
              ...item,
              votes: item.votes - 1,
              votedBy: item.votedBy.filter(id => id !== userId)
            };
          } else {
            // Add vote
            return {
              ...item,
              votes: item.votes + 1,
              votedBy: [...item.votedBy, userId]
            };
          }
        }
        return item;
      });
      
      // Sort by votes (descending)
      updatedQueue.sort((a, b) => b.votes - a.votes);
      
      return {
        ...prev,
        queue: updatedQueue
      };
    });
  }, [currentSession, userId]);
  
  // Get session members excluding current user
  const members = currentSession?.members.filter(m => m.id !== userId) || [];
  
  // Get queued tracks
  const queuedTracks = currentSession?.queue || [];
  
  // Check if current user is the host
  const isHost = currentSession?.hostId === userId;
  
  return {
    currentSession,
    isHost,
    members,
    queuedTracks,
    createSession,
    joinSession,
    leaveSession,
    endSession,
    addTrackToQueue,
    voteForTrack
  };
}
