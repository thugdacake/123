import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import TrackItem from "@/components/TrackItem";
import PlaylistItem from "@/components/PlaylistItem";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const { data: playlists = [] } = useQuery({
    queryKey: ['/api/playlists/recent'],
  });
  
  const { data: tracks = [] } = useQuery({
    queryKey: ['/api/tracks/recent'],
  });
  
  return (
    <div id="home-screen" className="screen active px-5 pt-2 pb-4">
      <div className="welcome-area mb-6">
        <h2 className="font-heading font-semibold text-xl mb-1">Bem-vindo ao Tokyo Box</h2>
        <p className="text-sm text-gray-400">Seu player de música VIP</p>
      </div>
      
      {/* New Feature Highlight */}
      <div className="new-feature-card bg-gradient-to-r from-tokyo-pink to-tokyo-purple rounded-xl p-4 mb-6 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <div className="bg-white bg-opacity-20 text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2">NOVO</div>
            <h3 className="font-heading font-semibold text-lg">Ouvir Junto</h3>
            <p className="text-sm text-white text-opacity-90 mt-1">Compartilhe sua música com amigos através do Bluetooth.</p>
          </div>
          <div className="feature-icon p-2 rounded-lg bg-white bg-opacity-20">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <button 
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium py-2 px-4 rounded-lg mt-3 w-full transition"
          onClick={() => setLocation("/group-session")}
        >
          Experimentar agora
        </button>
      </div>
      
      {/* Recent Playlists */}
      <div className="section mb-6">
        <div className="section-header flex justify-between items-center mb-3">
          <h3 className="font-heading font-semibold">Playlists Recentes</h3>
          <button className="text-sm text-tokyo-pink" onClick={() => setLocation("/library")}>
            Ver todas
          </button>
        </div>
        <div id="recent-playlists" className="horizontal-scroll flex space-x-3 overflow-x-auto pb-2">
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <PlaylistItem 
                key={playlist.id} 
                playlist={playlist}
                onClick={() => setLocation(`/playlist/${playlist.id}`)}
              />
            ))
          ) : (
            <div className="empty-message text-sm text-gray-400 py-4">
              Você ainda não tem playlists
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Tracks */}
      <div className="section">
        <div className="section-header flex justify-between items-center mb-3">
          <h3 className="font-heading font-semibold">Músicas Recentes</h3>
          <button className="text-sm text-tokyo-pink" onClick={() => setLocation("/tracks")}>
            Ver todas
          </button>
        </div>
        <div id="recent-tracks" className="track-list space-y-2">
          {tracks.length > 0 ? (
            tracks.map((track) => (
              <TrackItem 
                key={track.id} 
                track={track}
              />
            ))
          ) : (
            <div className="empty-message text-sm text-gray-400 py-4">
              Nenhuma música tocada recentemente
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
