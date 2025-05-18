import { useState, useEffect } from "react";
import { useGroupSession } from "@/hooks/useGroupSession";
import { usePlayer } from "@/context/PlayerContext";
import TrackItem from "@/components/TrackItem";
import { ThumbsUp } from "lucide-react";

export default function GroupSession() {
  const { 
    currentSession,
    isHost,
    members,
    queuedTracks,
    createSession,
    joinSession,
    leaveSession,
    addTrackToQueue,
    voteForTrack,
    endSession
  } = useGroupSession();
  
  const { currentTrack } = usePlayer();
  
  const [joining, setJoining] = useState(false);
  const [sessionIdInput, setSessionIdInput] = useState("");
  
  // Handle session creation
  const handleCreateSession = () => {
    if (!currentTrack) return;
    createSession();
  };
  
  // Handle session joining
  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionIdInput.trim()) {
      joinSession(sessionIdInput.trim());
    }
  };
  
  if (!currentSession) {
    return (
      <div id="group-session-screen" className="screen px-5 pt-2 pb-20">
        <div className="screen-header mb-6">
          <h2 className="font-heading font-semibold text-xl mb-1">Sessão em Grupo</h2>
          <p className="text-sm text-gray-400">Ouvir junto com seus amigos</p>
        </div>
        
        <div className="flex flex-col items-center justify-center py-8">
          <div className="session-options space-y-4 w-full">
            <div className="p-4 bg-tokyo-darkElevated rounded-xl">
              <h3 className="font-heading font-semibold mb-4">Criar Nova Sessão</h3>
              <p className="text-sm text-gray-400 mb-4">
                Inicie sua própria sessão e convide outros para ouvirem música junto.
              </p>
              <button 
                className="w-full py-2 px-4 bg-tokyo-purple rounded-lg font-medium"
                onClick={handleCreateSession}
                disabled={!currentTrack}
              >
                Criar Sessão
              </button>
              {!currentTrack && (
                <p className="text-xs text-tokyo-error mt-2">
                  Inicie uma música primeiro para criar uma sessão.
                </p>
              )}
            </div>
            
            <div className="p-4 bg-tokyo-darkElevated rounded-xl">
              <h3 className="font-heading font-semibold mb-4">Entrar em uma Sessão</h3>
              <form onSubmit={handleJoinSession}>
                <div className="mb-4">
                  <label className="block text-sm mb-1">ID da Sessão</label>
                  <input 
                    type="text" 
                    className="w-full p-2 rounded bg-tokyo-darkHighlight border border-gray-700"
                    placeholder="Ex: 1234"
                    value={sessionIdInput}
                    onChange={(e) => setSessionIdInput(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-2 px-4 bg-tokyo-pink rounded-lg font-medium"
                  disabled={joining || !sessionIdInput.trim()}
                >
                  {joining ? "Entrando..." : "Entrar na Sessão"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div id="group-session-screen" className="screen px-5 pt-2 pb-20">
      <div className="screen-header mb-6">
        <h2 className="font-heading font-semibold text-xl mb-1">Sessão em Grupo</h2>
        <p className="text-sm text-gray-400">Ouvir junto com seus amigos</p>
      </div>
      
      {/* Current Session Info */}
      <div className="current-session mb-6 p-4 bg-gradient-to-r from-tokyo-purple to-tokyo-pink rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="session-status font-medium text-white">Sessão Ativa</div>
          <div className="session-id bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
            ID: {currentSession.id}
          </div>
        </div>
        
        <div className="session-members-count flex items-center text-white text-sm mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 mr-1"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>{members.length} participantes</span>
        </div>
        
        {currentTrack && (
          <div className="now-playing bg-black bg-opacity-20 rounded-lg p-3 mb-4">
            <div className="text-xs text-white text-opacity-80 mb-1">Tocando agora:</div>
            <div className="flex items-center">
              <div className="track-thumbnail w-10 h-10 rounded bg-tokyo-darkHighlight overflow-hidden mr-3">
                <img 
                  src={currentTrack.thumbnailUrl} 
                  alt={currentTrack.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="track-info flex-1 min-w-0">
                <div className="track-title text-sm font-medium truncate text-white">
                  {currentTrack.title}
                </div>
                <div className="track-artist text-xs text-white text-opacity-80 truncate">
                  {currentTrack.artist}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="session-controls flex space-x-2">
          <button className="flex-1 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium text-white">
            Convidar
          </button>
          <button 
            className="flex-1 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium text-white"
            onClick={isHost ? endSession : leaveSession}
          >
            {isHost ? "Encerrar" : "Sair"}
          </button>
        </div>
      </div>
      
      {/* Session Members */}
      <div className="session-members mb-6">
        <div className="section-header flex justify-between items-center mb-3">
          <h3 className="font-heading font-semibold">Participantes</h3>
          <span className="text-sm text-gray-400">{members.length}/16</span>
        </div>
        <div className="members-list space-y-2">
          {/* Host (you) */}
          {isHost && (
            <div className="member-item p-3 bg-tokyo-darkElevated rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="member-avatar w-10 h-10 rounded-full bg-tokyo-pink text-white flex items-center justify-center mr-3">
                  <span className="font-medium">VC</span>
                </div>
                <div>
                  <div className="member-name font-medium">Você</div>
                  <div className="member-role text-xs text-tokyo-pink">Anfitrião</div>
                </div>
              </div>
              <div className="member-controls">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-tokyo-pink"
                >
                  <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm0 16h20" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Other Members */}
          {members.map((member) => (
            <div key={member.id} className="member-item p-3 bg-tokyo-darkElevated rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="member-avatar w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center mr-3">
                  <span className="font-medium">
                    {member.name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="member-name font-medium">{member.name}</div>
                  <div className="member-role text-xs text-gray-400">
                    {member.isHost ? "Anfitrião" : "Ouvindo"}
                  </div>
                </div>
              </div>
              {isHost && !member.isHost && (
                <div className="member-controls">
                  <button className="p-2 rounded-full hover:bg-tokyo-darkHighlight">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Queue */}
      <div className="session-queue">
        <div className="section-header flex justify-between items-center mb-3">
          <h3 className="font-heading font-semibold">Fila de Reprodução</h3>
          <button className="text-sm text-tokyo-pink">
            Adicionar
          </button>
        </div>
        {queuedTracks.length > 0 ? (
          <div className="queue-list space-y-2">
            {queuedTracks.map((queueItem, index) => (
              <div key={queueItem.track.id} className="track-item flex items-center p-2 rounded-lg bg-tokyo-darkElevated">
                <div className="track-index w-6 text-center text-sm text-gray-400">{index + 1}</div>
                <div className="track-thumbnail w-10 h-10 rounded bg-tokyo-darkHighlight overflow-hidden mx-2">
                  <img 
                    src={queueItem.track.thumbnailUrl} 
                    alt={queueItem.track.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="track-info flex-1 min-w-0">
                  <div className="track-title text-sm font-medium truncate">
                    {queueItem.track.title}
                  </div>
                  <div className="track-artist text-xs text-gray-400 truncate">
                    {queueItem.track.artist}
                  </div>
                </div>
                <div className="track-controls flex space-x-1">
                  <div className="text-xs text-gray-400 flex items-center mr-2">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    <span>{queueItem.votes}</span>
                  </div>
                  <button 
                    className="p-1.5 rounded-full hover:bg-tokyo-darkHighlight"
                    onClick={() => voteForTrack(queueItem.track.id)}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 bg-tokyo-darkElevated rounded-lg text-sm text-gray-400">
            Nenhuma música na fila. Adicione músicas para ouvir em seguida.
          </div>
        )}
      </div>
    </div>
  );
}
