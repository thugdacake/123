import { useState } from "react";
import { X, Bluetooth, Users, Volume2, RefreshCw } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useBluetooth } from "@/context/BluetoothContext";
import { useGroupSession } from "@/hooks/useGroupSession";
import { generateSessionId } from "@/lib/utils";

interface SharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  showNotification: (title: string, message: string, icon?: string) => void;
}

export default function SharingModal({ 
  isOpen, 
  onClose,
  showNotification
}: SharingModalProps) {
  const { currentTrack } = usePlayer();
  const { 
    bluetoothEnabled, 
    nearbyDevices, 
    refreshDevices,
    connectToDevice
  } = useBluetooth();
  const { createSession } = useGroupSession();
  
  const [spatialAudio, setSpatialAudio] = useState(false);
  const [audioRange, setAudioRange] = useState(5.0);
  
  if (!isOpen || !currentTrack) return null;
  
  const handleCreateSession = () => {
    const sessionId = generateSessionId();
    createSession(sessionId);
    showNotification(
      "Sessão criada",
      `Sessão ${sessionId} iniciada com sucesso`,
      "users"
    );
    onClose();
  };
  
  const handleBluetoothTransmit = () => {
    if (nearbyDevices.length === 0) {
      showNotification(
        "Sem dispositivos",
        "Nenhum dispositivo próximo encontrado",
        "bluetooth"
      );
      return;
    }
    
    showNotification(
      "Transmitindo",
      `Transmitindo para ${nearbyDevices.length} dispositivos`,
      "bluetooth"
    );
    onClose();
  };
  
  return (
    <div 
      id="sharing-modal" 
      className="absolute inset-0 bg-black bg-opacity-80 z-30 flex items-end justify-center"
      onClick={onClose}
    >
      <div 
        className="sharing-modal-content bg-tokyo-darkElevated w-full max-h-[70%] rounded-t-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex justify-between items-center mb-6">
          <h3 className="font-heading font-semibold text-lg">Compartilhar Música</h3>
          <button 
            id="close-sharing-modal" 
            className="btn-icon w-8 h-8 rounded-full flex items-center justify-center bg-tokyo-darkHighlight"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="sharing-track flex items-center p-3 bg-tokyo-darkHighlight rounded-lg mb-6">
          <div className="track-thumbnail w-12 h-12 rounded-md overflow-hidden mr-3">
            <img 
              src={currentTrack.thumbnailUrl} 
              alt={currentTrack.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="track-info flex-1 min-w-0">
            <div className="track-title text-sm font-medium truncate">{currentTrack.title}</div>
            <div className="track-artist text-xs text-gray-400 truncate">{currentTrack.artist}</div>
          </div>
        </div>
        
        <div className="sharing-options space-y-4">
          <div className="option-section">
            <h4 className="text-sm font-medium mb-3">Compartilhar via Bluetooth</h4>
            <div className="bluetooth-option p-3 bg-tokyo-darkHighlight rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="icon-container mr-3 bg-tokyo-pink bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center">
                  <Bluetooth className="w-5 h-5 text-tokyo-pink" />
                </div>
                <div>
                  <div className="option-name font-medium">Transmitir a dispositivos próximos</div>
                  <div className="option-desc text-xs text-gray-400">
                    {bluetoothEnabled 
                      ? `${nearbyDevices.length} dispositivos disponíveis` 
                      : "Bluetooth desativado"}
                  </div>
                </div>
              </div>
              {bluetoothEnabled ? (
                <button 
                  className="px-3 py-1.5 bg-tokyo-pink rounded-lg text-xs font-medium text-white"
                  onClick={handleBluetoothTransmit}
                >
                  Transmitir
                </button>
              ) : (
                <button 
                  className="px-3 py-1.5 bg-gray-700 rounded-lg text-xs font-medium text-white"
                  disabled
                >
                  Ativar
                </button>
              )}
            </div>
          </div>
          
          <div className="option-section">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium">Iniciar Sessão em Grupo</h4>
              <button 
                className="text-sm text-tokyo-pink flex items-center"
                onClick={refreshDevices}
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Atualizar
              </button>
            </div>
            <div className="group-session-option p-3 bg-tokyo-darkHighlight rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="icon-container mr-3 bg-tokyo-purple bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-tokyo-purple" />
                </div>
                <div>
                  <div className="option-name font-medium">Criar uma sessão de grupo</div>
                  <div className="option-desc text-xs text-gray-400">Permite até 16 participantes</div>
                </div>
              </div>
              <button 
                className="px-3 py-1.5 bg-tokyo-purple rounded-lg text-xs font-medium text-white"
                onClick={handleCreateSession}
              >
                Criar
              </button>
            </div>
          </div>
          
          <div className="option-section">
            <h4 className="text-sm font-medium mb-3">Configurações de Áudio 3D</h4>
            <div className="spatial-audio-option p-3 bg-tokyo-darkHighlight rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="icon-container mr-3 bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="option-name font-medium">Áudio 3D</div>
                    <div className="option-desc text-xs text-gray-400">Outros jogadores próximos poderão ouvir</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={spatialAudio}
                    onChange={(e) => setSpatialAudio(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-tokyo-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              
              <div className="range-slider">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                  <span>Alcance do áudio</span>
                  <span>{audioRange.toFixed(1)}m</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="0.1" 
                  value={audioRange}
                  onChange={(e) => setAudioRange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-full appearance-none" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
