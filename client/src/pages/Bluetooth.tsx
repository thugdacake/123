import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import DeviceItem from "@/components/DeviceItem";
import { useBluetooth } from "@/context/BluetoothContext";
import { simulateDiscoveryDelay } from "@/lib/utils";

export default function Bluetooth() {
  const { 
    bluetoothEnabled, 
    toggleBluetooth,
    discoverable,
    setDiscoverable,
    autoAccept,
    setAutoAccept,
    bluetoothRange,
    setBluetoothRange,
    connectedDevices,
    nearbyDevices,
    connectToDevice,
    disconnectDevice,
    refreshDevices
  } = useBluetooth();
  
  const [isDiscovering, setIsDiscovering] = useState(false);
  
  // Handle device refresh with loading state
  const handleRefreshDevices = async () => {
    setIsDiscovering(true);
    await simulateDiscoveryDelay();
    await refreshDevices();
    setIsDiscovering(false);
  };
  
  // Auto-discover devices on first load
  useEffect(() => {
    if (bluetoothEnabled && nearbyDevices.length === 0) {
      handleRefreshDevices();
    }
  }, [bluetoothEnabled]);
  
  return (
    <div id="bluetooth-screen" className="screen px-5 pt-2 pb-20">
      <div className="screen-header mb-6">
        <h2 className="font-heading font-semibold text-xl mb-1">Bluetooth</h2>
        <p className="text-sm text-gray-400">Conecte-se e compartilhe música</p>
      </div>
      
      {/* Bluetooth Controls */}
      <div className="bluetooth-controls flex items-center justify-between mb-6 p-4 bg-tokyo-darkHighlight rounded-xl">
        <div className="flex items-center">
          <div className="icon-container mr-3 bg-tokyo-pink bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-tokyo-pink"
            >
              <path d="M7 7l10 10-5 5V2l5 5L7 17" />
            </svg>
          </div>
          <div>
            <div className="font-medium">Bluetooth</div>
            <div className="text-sm text-gray-400" id="bluetooth-status">
              {bluetoothEnabled ? "Ativo" : "Desativado"}
            </div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={bluetoothEnabled}
            onChange={() => toggleBluetooth()}
          />
          <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-tokyo-pink peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </label>
      </div>
      
      {/* Connected Devices */}
      {connectedDevices.length > 0 && (
        <div className="section mb-6">
          <div className="section-header flex justify-between items-center mb-3">
            <h3 className="font-heading font-semibold">Dispositivos Conectados</h3>
            <span className="text-sm text-gray-400">{connectedDevices.length} dispositivos</span>
          </div>
          <div className="devices-list space-y-3">
            {connectedDevices.map((device) => (
              <DeviceItem
                key={device.id}
                device={device}
                isConnected={true}
                onMoreClick={() => disconnectDevice(device.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Available Devices */}
      {bluetoothEnabled && (
        <div className="section mb-6">
          <div className="section-header flex justify-between items-center mb-3">
            <h3 className="font-heading font-semibold">Dispositivos Próximos</h3>
            <button 
              className="text-sm text-tokyo-pink flex items-center"
              onClick={handleRefreshDevices}
              disabled={isDiscovering}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isDiscovering ? "animate-spin" : ""}`} /> 
              {isDiscovering ? "Buscando" : "Atualizar"}
            </button>
          </div>
          <div className="devices-list space-y-3">
            {nearbyDevices.length > 0 ? (
              nearbyDevices.map((device) => (
                <DeviceItem
                  key={device.id}
                  device={device}
                  onConnect={() => connectToDevice(device.id)}
                />
              ))
            ) : (
              <div className="text-center p-4 text-sm text-gray-400">
                {isDiscovering 
                  ? "Buscando dispositivos próximos..." 
                  : "Nenhum dispositivo encontrado. Tente atualizar."}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Bluetooth Settings */}
      {bluetoothEnabled && (
        <div className="bluetooth-settings bg-tokyo-darkElevated rounded-xl p-4">
          <h3 className="font-heading font-semibold mb-3">Configurações</h3>
          <div className="settings-list space-y-4">
            <div className="setting-item flex items-center justify-between">
              <div>
                <div className="setting-name font-medium">Visível para outros</div>
                <div className="setting-description text-xs text-gray-400">Permitir que outros dispositivos te encontrem</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={discoverable}
                  onChange={(e) => setDiscoverable(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-tokyo-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="setting-item flex items-center justify-between">
              <div>
                <div className="setting-name font-medium">Aceitar automaticamente</div>
                <div className="setting-description text-xs text-gray-400">Aceitar solicitações de pareamento sem confirmação</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={autoAccept}
                  onChange={(e) => setAutoAccept(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-tokyo-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="setting-item">
              <div className="mb-2">
                <div className="setting-name font-medium">Alcance de descoberta</div>
                <div className="setting-description text-xs text-gray-400">Distância máxima para descobrir dispositivos</div>
              </div>
              <div className="range-slider">
                <input 
                  type="range" 
                  min="5" 
                  max="30" 
                  value={bluetoothRange}
                  onChange={(e) => setBluetoothRange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="range-labels flex justify-between text-xs text-gray-400 mt-1">
                  <span>5m</span>
                  <span>{bluetoothRange}m</span>
                  <span>30m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
