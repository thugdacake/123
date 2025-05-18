import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Device } from "@shared/schema";
import { simulateDiscoveryDelay, getRandomInt } from "@/lib/utils";

interface BluetoothContextType {
  bluetoothEnabled: boolean;
  toggleBluetooth: () => void;
  discoverable: boolean;
  setDiscoverable: (value: boolean) => void;
  autoAccept: boolean;
  setAutoAccept: (value: boolean) => void;
  bluetoothRange: number;
  setBluetoothRange: (value: number) => void;
  connectedDevices: Device[];
  nearbyDevices: Device[];
  refreshDevices: () => Promise<void>;
  connectToDevice: (deviceId: number) => void;
  disconnectDevice: (deviceId: number) => void;
}

const BluetoothContext = createContext<BluetoothContextType>({
  bluetoothEnabled: false,
  toggleBluetooth: () => {},
  discoverable: false,
  setDiscoverable: () => {},
  autoAccept: false,
  setAutoAccept: () => {},
  bluetoothRange: 15,
  setBluetoothRange: () => {},
  connectedDevices: [],
  nearbyDevices: [],
  refreshDevices: async () => {},
  connectToDevice: () => {},
  disconnectDevice: () => {}
});

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    bluetoothEnabled: true,
    discoverable: true,
    autoAccept: false,
    bluetoothRange: 15,
    connectedDevices: [] as Device[],
    nearbyDevices: [] as Device[]
  });
  
  // Toggle Bluetooth state
  const toggleBluetooth = useCallback(() => {
    setState(prev => ({
      ...prev,
      bluetoothEnabled: !prev.bluetoothEnabled
    }));
  }, []);
  
  // Set discoverable state
  const setDiscoverable = useCallback((value: boolean) => {
    setState(prev => ({
      ...prev,
      discoverable: value
    }));
  }, []);
  
  // Set auto-accept state
  const setAutoAccept = useCallback((value: boolean) => {
    setState(prev => ({
      ...prev,
      autoAccept: value
    }));
  }, []);
  
  // Set Bluetooth range
  const setBluetoothRange = useCallback((value: number) => {
    setState(prev => ({
      ...prev,
      bluetoothRange: value
    }));
  }, []);
  
  // Refresh nearby devices list
  const refreshDevices = useCallback(async () => {
    // For demo, we'll simulate finding random devices
    await simulateDiscoveryDelay();
    
    // If bluetooth is enabled, generate some mock devices
    if (state.bluetoothEnabled) {
      const mockDevices: Device[] = [
        {
          id: 1,
          name: "Amanda's Phone",
          type: "phone",
          userId: 1,
          isPlaying: false,
          lastConnected: new Date()
        },
        {
          id: 2,
          name: "Felipe's Device",
          type: "phone",
          userId: 2,
          isPlaying: false,
          lastConnected: new Date()
        },
        {
          id: 3,
          name: "Airbuds Pro",
          type: "headphones",
          userId: 1,
          isPlaying: false,
          lastConnected: new Date()
        }
      ];
      
      setState(prev => ({
        ...prev,
        nearbyDevices: mockDevices.filter(
          device => !prev.connectedDevices.some(connected => connected.id === device.id)
        )
      }));
    }
  }, [state.bluetoothEnabled]);
  
  // Connect to a device
  const connectToDevice = useCallback((deviceId: number) => {
    setState(prev => {
      const deviceToConnect = prev.nearbyDevices.find(d => d.id === deviceId);
      
      if (!deviceToConnect) return prev;
      
      const updatedConnectedDevices = [...prev.connectedDevices, deviceToConnect];
      const updatedNearbyDevices = prev.nearbyDevices.filter(d => d.id !== deviceId);
      
      return {
        ...prev,
        connectedDevices: updatedConnectedDevices,
        nearbyDevices: updatedNearbyDevices
      };
    });
  }, []);
  
  // Disconnect a device
  const disconnectDevice = useCallback((deviceId: number) => {
    setState(prev => {
      const deviceToDisconnect = prev.connectedDevices.find(d => d.id === deviceId);
      
      if (!deviceToDisconnect) return prev;
      
      const updatedConnectedDevices = prev.connectedDevices.filter(d => d.id !== deviceId);
      const updatedNearbyDevices = [...prev.nearbyDevices, deviceToDisconnect];
      
      return {
        ...prev,
        connectedDevices: updatedConnectedDevices,
        nearbyDevices: updatedNearbyDevices
      };
    });
  }, []);
  
  // Initialize with random connected device for demo
  useEffect(() => {
    const initialConnected: Device[] = [
      {
        id: 4,
        name: "Carlos's iPhone",
        type: "phone",
        userId: 3,
        isPlaying: true,
        lastConnected: new Date()
      }
    ];
    
    setState(prev => ({
      ...prev,
      connectedDevices: initialConnected
    }));
    
    // Initial device discovery
    refreshDevices();
  }, [refreshDevices]);
  
  const value = {
    ...state,
    toggleBluetooth,
    setDiscoverable,
    setAutoAccept,
    setBluetoothRange,
    refreshDevices,
    connectToDevice,
    disconnectDevice
  };

  return (
    <BluetoothContext.Provider value={value}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);
