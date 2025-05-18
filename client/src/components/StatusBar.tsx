import { Clock, Wifi, Battery } from "lucide-react";
import { useState, useEffect } from "react";
import { useBluetooth } from "@/context/BluetoothContext";
import { useTheme } from "@/context/ThemeContext";

export default function StatusBar() {
  const [time, setTime] = useState<string>("00:00");
  const { bluetoothEnabled } = useBluetooth();
  const { theme } = useTheme();
  
  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    
    updateTime(); // Initial update
    
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`status-bar flex justify-between items-center h-7 px-6 pt-1 text-sm ${
      theme === "dark" ? "bg-tokyo-darkElevated" : "bg-tokyo-lightElevated text-black"
    }`}>
      <div className="time">{time}</div>
      <div className="status-icons flex space-x-2">
        <div className="bluetooth-status relative" data-state={bluetoothEnabled ? "on" : "off"}>
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
            className={`w-4 h-4 ${bluetoothEnabled ? "text-tokyo-pink" : ""}`}
          >
            <path d="M7 7l10 10-5 5V2l5 5L7 17" />
          </svg>
          {bluetoothEnabled && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-tokyo-success rounded-full"></div>
          )}
        </div>
        <Wifi className="w-4 h-4" />
        <Battery className="w-4 h-4" />
      </div>
    </div>
  );
}
