import { Smartphone, Headphones, User, MoreVertical } from "lucide-react";
import { Device } from "@shared/schema";

interface DeviceItemProps {
  device: Device;
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMoreClick?: () => void;
}

export default function DeviceItem({ 
  device, 
  isConnected = false,
  onConnect,
  onDisconnect,
  onMoreClick
}: DeviceItemProps) {
  // Determine which icon to show based on device type
  const getDeviceIcon = () => {
    switch (device.type) {
      case "phone":
        return <Smartphone className="w-5 h-5" />;
      case "headphones":
        return <Headphones className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };
  
  return (
    <div className="device-item p-3 bg-tokyo-darkElevated rounded-lg flex items-center justify-between">
      <div className="flex items-center">
        <div className="device-icon mr-3 w-10 h-10 bg-tokyo-darkHighlight rounded-lg flex items-center justify-center">
          {getDeviceIcon()}
        </div>
        <div>
          <div className="device-name font-medium">{device.name}</div>
          <div className={`device-status text-xs ${
            isConnected ? "text-tokyo-success" : "text-gray-400"
          }`}>
            {isConnected ? (device.isPlaying ? "Reproduzindo" : "Conectado") : "Disponível"}
          </div>
        </div>
      </div>
      <div className="device-actions">
        {isConnected ? (
          <button 
            className="p-2 rounded-full hover:bg-tokyo-darkHighlight"
            onClick={onMoreClick}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        ) : (
          <button 
            className="px-3 py-1.5 bg-tokyo-pink rounded-lg text-xs font-medium"
            onClick={onConnect}
          >
            Conectar
          </button>
        )}
      </div>
    </div>
  );
}
