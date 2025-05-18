import { useState, useEffect, useCallback } from "react";
import { Device } from "@shared/schema";
import { simulateDiscoveryDelay } from "@/lib/utils";

interface BluetoothState {
  bluetoothEnabled: boolean;
  discoverable: boolean;
  autoAccept: boolean;
  bluetoothRange: number;
  connectedDevices: Device[];
  nearbyDevices: Device[];
}

export function useBluetooth() {
  const [state, setState] = useState<BluetoothState>({
    bluetoothEnabled: true,
    discoverable: true,
    autoAccept: false,
    bluetoothRange: 15,
    connectedDevices: [],
    nearbyDevices: []
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
  }, []);
  
  return {
    ...state,
    toggleBluetooth,
    setDiscoverable,
    setAutoAccept,
    setBluetoothRange,
    refreshDevices,
    connectToDevice,
    disconnectDevice
  };
}
