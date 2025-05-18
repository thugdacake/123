/**
 * Tokyo Box Bluetooth Functionality
 * Provides virtual Bluetooth connectivity between players
 */

// Global namespace for Bluetooth functionality
window.TokyoBoxBluetooth = {
    // State management
    state: {
        isEnabled: false,
        discoverable: false,
        autoAccept: false,
        bluetoothRange: 50,
        connectedDevices: [],
        nearbyDevices: []
    },
    
    // Device connection states
    connectionStates: {
        DISCONNECTED: 'disconnected',
        CONNECTING: 'connecting',
        CONNECTED: 'connected',
        FAILED: 'failed'
    },
    
    // Initialize Bluetooth functionality
    init: function() {
        console.log('Initializing Tokyo Box Bluetooth module...');
        
        // Set up event listeners for UI controls
        this.setupEventListeners();
        
        // Create the Bluetooth connection overlay
        this.createConnectionOverlay();
        
        // Generate simulated devices
        this.generateSimulatedDevices();
        
        console.log('Tokyo Box Bluetooth module initialized successfully');
    },
    
    // Set up event listeners for Bluetooth controls
    setupEventListeners: function() {
        // Bluetooth toggle
        const bluetoothToggle = document.getElementById('bluetooth-toggle');
        if (bluetoothToggle) {
            bluetoothToggle.addEventListener('change', () => {
                this.toggleBluetooth(bluetoothToggle.checked);
            });
        }
        
        // Discoverable toggle
        const discoverableToggle = document.getElementById('discoverable-toggle');
        if (discoverableToggle) {
            discoverableToggle.addEventListener('change', () => {
                this.setDiscoverable(discoverableToggle.checked);
            });
        }
        
        // Auto-accept toggle
        const autoAcceptToggle = document.getElementById('auto-accept-toggle');
        if (autoAcceptToggle) {
            autoAcceptToggle.addEventListener('change', () => {
                this.setAutoAccept(autoAcceptToggle.checked);
            });
        }
        
        // Bluetooth range slider
        const bluetoothRangeSlider = document.getElementById('bluetooth-range');
        const bluetoothRangeValue = document.getElementById('bluetooth-range-value');
        if (bluetoothRangeSlider && bluetoothRangeValue) {
            bluetoothRangeSlider.addEventListener('input', () => {
                const value = bluetoothRangeSlider.value;
                bluetoothRangeValue.textContent = `${value}m`;
                this.setBluetoothRange(parseInt(value));
            });
        }
        
        // Refresh devices button
        const refreshDevicesButton = document.getElementById('refresh-devices');
        if (refreshDevicesButton) {
            refreshDevicesButton.addEventListener('click', () => {
                this.refreshDevices();
            });
        }
        
        // Navigation to Bluetooth screen
        const bluetoothNavItem = document.getElementById('nav-bluetooth');
        if (bluetoothNavItem) {
            bluetoothNavItem.addEventListener('click', () => {
                // Update UI with current state when navigating to the screen
                this.updateBluetoothUI();
            });
        }
    },
    
    // Create the connection overlay for pairing/connecting
    createConnectionOverlay: function() {
        // Create overlay element if it doesn't exist
        if (!document.getElementById('bluetooth-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'bluetooth-overlay';
            overlay.className = 'overlay hidden';
            overlay.innerHTML = `
                <div class="overlay-content">
                    <div class="overlay-header">
                        <h3>Bluetooth Connection</h3>
                        <button class="btn-icon" id="close-bt-overlay">
                            <i data-feather="x"></i>
                        </button>
                    </div>
                    <div class="overlay-body">
                        <div class="device-info">
                            <div class="device-icon">
                                <i data-feather="smartphone"></i>
                            </div>
                            <div class="device-name" id="connecting-device-name">Device Name</div>
                            <div class="connection-status" id="connection-status">Connecting...</div>
                        </div>
                        <div class="connection-progress">
                            <div class="progress-bar">
                                <div class="progress-indicator" id="connection-progress"></div>
                            </div>
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-secondary" id="cancel-connection">Cancel</button>
                        <button class="btn btn-primary" id="accept-connection">Accept</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Set up event listeners for overlay
            document.getElementById('close-bt-overlay').addEventListener('click', () => {
                this.hideConnectionOverlay();
            });
            
            document.getElementById('cancel-connection').addEventListener('click', () => {
                this.hideConnectionOverlay();
            });
            
            document.getElementById('accept-connection').addEventListener('click', () => {
                this.acceptConnection();
            });
            
            // Refresh icons
            if (window.feather) {
                window.feather.replace();
            }
        }
    },
    
    // Show the connection overlay
    showConnectionOverlay: function(device, isIncoming = false) {
        const overlay = document.getElementById('bluetooth-overlay');
        const deviceNameElement = document.getElementById('connecting-device-name');
        const statusElement = document.getElementById('connection-status');
        const progressElement = document.getElementById('connection-progress');
        const acceptButton = document.getElementById('accept-connection');
        
        if (overlay && deviceNameElement && statusElement && progressElement) {
            // Update device name
            deviceNameElement.textContent = device.name;
            
            // Update status message
            statusElement.textContent = isIncoming
                ? 'Incoming connection request...'
                : 'Connecting...';
            
            // Show/hide accept button based on whether it's an incoming connection
            acceptButton.style.display = isIncoming ? 'block' : 'none';
            
            // Reset progress
            progressElement.style.width = '0%';
            
            // Show overlay
            overlay.classList.remove('hidden');
            
            // If not incoming, start connection animation
            if (!isIncoming) {
                this.animateConnectionProgress(progressElement, device);
            }
        }
    },
    
    // Hide the connection overlay
    hideConnectionOverlay: function() {
        const overlay = document.getElementById('bluetooth-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },
    
    // Accept an incoming connection
    acceptConnection: function() {
        const deviceNameElement = document.getElementById('connecting-device-name');
        if (deviceNameElement) {
            const deviceName = deviceNameElement.textContent;
            const device = this.state.nearbyDevices.find(d => d.name === deviceName);
            
            if (device) {
                // Find the progress element
                const progressElement = document.getElementById('connection-progress');
                
                // Animate the connection process
                this.animateConnectionProgress(progressElement, device, true);
            }
        }
    },
    
    // Animate the connection progress bar
    animateConnectionProgress: function(progressElement, device, accepted = false) {
        let progress = 0;
        const statusElement = document.getElementById('connection-status');
        
        // Random factor to simulate connection quality
        const connectionSpeed = Math.random() * 30 + 20; // between 20-50ms
        
        // Calculate simulated connection time (shorter if accepted)
        const connectionTime = accepted ? 2000 : (Math.random() * 2000 + 2000); // 2-4 seconds
        
        const interval = setInterval(() => {
            if (progress >= 100) {
                clearInterval(interval);
                
                // Connection successful (80% chance)
                if (Math.random() < 0.8 || accepted) {
                    if (statusElement) {
                        statusElement.textContent = 'Connected!';
                        statusElement.classList.add('success');
                    }
                    
                    // Add to connected devices
                    this.connectDevice(device);
                    
                    // Close overlay after a short delay
                    setTimeout(() => {
                        this.hideConnectionOverlay();
                        
                        // Show notification
                        this.showNotification(
                            'Bluetooth Connected',
                            `Successfully connected to ${device.name}`,
                            'bluetooth'
                        );
                        
                        // Reset status class
                        if (statusElement) {
                            statusElement.classList.remove('success');
                        }
                    }, 1500);
                } else {
                    // Connection failed
                    if (statusElement) {
                        statusElement.textContent = 'Connection failed!';
                        statusElement.classList.add('error');
                    }
                    
                    // Close overlay after a short delay
                    setTimeout(() => {
                        this.hideConnectionOverlay();
                        
                        // Show notification
                        this.showNotification(
                            'Bluetooth Failed',
                            `Could not connect to ${device.name}`,
                            'bluetooth',
                            'error'
                        );
                        
                        // Reset status class
                        if (statusElement) {
                            statusElement.classList.remove('error');
                        }
                    }, 1500);
                }
            } else {
                progress += 100 / (connectionTime / connectionSpeed);
                progressElement.style.width = `${Math.min(progress, 100)}%`;
            }
        }, connectionSpeed);
    },
    
    // Toggle Bluetooth on/off
    toggleBluetooth: function(enable) {
        this.state.isEnabled = enable;
        console.log(`Bluetooth ${enable ? 'enabled' : 'disabled'}`);
        
        // Update UI
        this.updateBluetoothUI();
        
        // Refresh devices when enabled
        if (enable) {
            this.refreshDevices();
        } else {
            // Disconnect all devices when Bluetooth is turned off
            this.state.connectedDevices.forEach(device => {
                this.disconnectDevice(device.id);
            });
            
            // Clear devices lists
            this.updateDevicesList('connected-devices', []);
            this.updateDevicesList('nearby-devices', []);
        }
        
        // Show notification
        this.showNotification(
            'Bluetooth',
            `Bluetooth ${enable ? 'enabled' : 'disabled'}`,
            'bluetooth'
        );
    },
    
    // Set discoverable status
    setDiscoverable: function(discoverable) {
        this.state.discoverable = discoverable;
        console.log(`Discoverable: ${discoverable}`);
        
        // Show notification
        this.showNotification(
            'Bluetooth',
            `Your device is ${discoverable ? 'now discoverable' : 'no longer discoverable'}`,
            'bluetooth'
        );
    },
    
    // Set auto-accept setting
    setAutoAccept: function(autoAccept) {
        this.state.autoAccept = autoAccept;
        console.log(`Auto-accept: ${autoAccept}`);
    },
    
    // Set Bluetooth range
    setBluetoothRange: function(range) {
        this.state.bluetoothRange = range;
        console.log(`Bluetooth range set to: ${range}m`);
        
        // Refresh devices to update based on new range
        this.refreshDevices();
    },
    
    // Update the Bluetooth UI based on current state
    updateBluetoothUI: function() {
        const bluetoothToggle = document.getElementById('bluetooth-toggle');
        const discoverableToggle = document.getElementById('discoverable-toggle');
        const autoAcceptToggle = document.getElementById('auto-accept-toggle');
        const bluetoothRangeSlider = document.getElementById('bluetooth-range');
        const bluetoothRangeValue = document.getElementById('bluetooth-range-value');
        
        if (bluetoothToggle) {
            bluetoothToggle.checked = this.state.isEnabled;
        }
        
        if (discoverableToggle) {
            discoverableToggle.checked = this.state.discoverable;
            discoverableToggle.disabled = !this.state.isEnabled;
        }
        
        if (autoAcceptToggle) {
            autoAcceptToggle.checked = this.state.autoAccept;
            autoAcceptToggle.disabled = !this.state.isEnabled;
        }
        
        if (bluetoothRangeSlider) {
            bluetoothRangeSlider.value = this.state.bluetoothRange;
            bluetoothRangeSlider.disabled = !this.state.isEnabled;
        }
        
        if (bluetoothRangeValue) {
            bluetoothRangeValue.textContent = `${this.state.bluetoothRange}m`;
        }
        
        // Update device lists
        this.updateDevicesList('connected-devices', this.state.connectedDevices);
        this.updateDevicesList('nearby-devices', this.state.nearbyDevices);
    },
    
    // Generate simulated nearby devices
    generateSimulatedDevices: function() {
        // Mock device data
        const deviceTypes = ['Phone', 'Tablet', 'Laptop', 'Car', 'Speaker'];
        const deviceBrands = ['Samsung', 'Apple', 'Sony', 'JBL', 'Bose', 'Motorola', 'LG', 'Toyota', 'Ford'];
        const playerNames = ['Johnny', 'Maria', 'Carlos', 'Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan'];
        
        // Generate random devices based on range
        const deviceCount = Math.floor(Math.random() * 5) + 3; // 3-8 devices
        
        const devices = [];
        
        for (let i = 0; i < deviceCount; i++) {
            const brand = deviceBrands[Math.floor(Math.random() * deviceBrands.length)];
            const type = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
            const playerName = playerNames[Math.floor(Math.random() * playerNames.length)];
            const batteryLevel = Math.floor(Math.random() * 100);
            const signalStrength = Math.floor(Math.random() * 100);
            const distance = Math.floor(Math.random() * 80) + 5; // 5-85m
            
            devices.push({
                id: Date.now() + i,
                name: `${playerName}'s ${brand} ${type}`,
                type: type.toLowerCase(),
                batteryLevel,
                signalStrength,
                distance,
                isConnected: false
            });
        }
        
        // Store nearby devices
        this.state.nearbyDevices = devices;
    },
    
    // Refresh the list of nearby devices
    refreshDevices: function() {
        if (!this.state.isEnabled) {
            return;
        }
        
        // Show loading indicator
        const nearbyDevicesElement = document.getElementById('nearby-devices');
        if (nearbyDevicesElement) {
            nearbyDevicesElement.innerHTML = `<div class="loading-spinner"></div>`;
        }
        
        // Simulate network delay
        setTimeout(() => {
            // Regenerate simulated devices
            this.generateSimulatedDevices();
            
            // Filter devices based on range
            this.state.nearbyDevices = this.state.nearbyDevices.filter(device => {
                return device.distance <= this.state.bluetoothRange;
            });
            
            // Update the UI
            this.updateDevicesList('nearby-devices', this.state.nearbyDevices);
            
            // Show notification
            this.showNotification(
                'Bluetooth',
                `Found ${this.state.nearbyDevices.length} nearby devices`,
                'bluetooth'
            );
        }, 1500);
    },
    
    // Update a devices list in the UI
    updateDevicesList: function(listElementId, devices) {
        const listElement = document.getElementById(listElementId);
        if (!listElement) return;
        
        // Clear list
        listElement.innerHTML = '';
        
        // If no devices, show empty message
        if (devices.length === 0) {
            listElement.innerHTML = `
                <div class="empty-list-message">No ${listElementId === 'connected-devices' ? 'connected' : 'nearby'} devices</div>
            `;
            return;
        }
        
        // Add each device to the list
        devices.forEach(device => {
            const deviceElement = document.createElement('div');
            deviceElement.className = 'device-item';
            deviceElement.setAttribute('data-device-id', device.id);
            
            // Generate the icon class based on device type
            let iconName = 'smartphone';
            switch (device.type) {
                case 'tablet':
                    iconName = 'tablet';
                    break;
                case 'laptop':
                    iconName = 'laptop';
                    break;
                case 'car':
                    iconName = 'truck';
                    break;
                case 'speaker':
                    iconName = 'speaker';
                    break;
            }
            
            deviceElement.innerHTML = `
                <div class="device-icon">
                    <i data-feather="${iconName}"></i>
                </div>
                <div class="device-info">
                    <div class="device-name">${device.name}</div>
                    <div class="device-meta">
                        ${listElementId === 'nearby-devices' ? 
                            `<span class="device-distance">${device.distance}m</span>` : 
                            `<span class="device-status">Connected</span>`
                        }
                        <span class="battery-level">
                            <i data-feather="battery"></i> ${device.batteryLevel}%
                        </span>
                        <span class="signal-strength">
                            <i data-feather="wifi"></i> ${device.signalStrength}%
                        </span>
                    </div>
                </div>
                <div class="device-actions">
                    ${listElementId === 'connected-devices' ? 
                        `<button class="btn btn-icon btn-disconnect" title="Disconnect">
                            <i data-feather="x-circle"></i>
                        </button>` : 
                        `<button class="btn btn-icon btn-connect" title="Connect">
                            <i data-feather="link"></i>
                        </button>`
                    }
                </div>
            `;
            
            listElement.appendChild(deviceElement);
            
            // Add click events for the buttons
            if (listElementId === 'connected-devices') {
                deviceElement.querySelector('.btn-disconnect').addEventListener('click', () => {
                    this.disconnectDevice(device.id);
                });
            } else {
                deviceElement.querySelector('.btn-connect').addEventListener('click', () => {
                    this.initiateConnection(device);
                });
            }
        });
        
        // Refresh icons
        if (window.feather) {
            window.feather.replace();
        }
    },
    
    // Initiate a connection to a device
    initiateConnection: function(device) {
        // Make sure Bluetooth is enabled
        if (!this.state.isEnabled) {
            this.showNotification(
                'Bluetooth Error',
                'Bluetooth is not enabled',
                'bluetooth',
                'error'
            );
            return;
        }
        
        // Check if already connected
        if (this.isDeviceConnected(device.id)) {
            this.showNotification(
                'Bluetooth Error',
                `Already connected to ${device.name}`,
                'bluetooth',
                'error'
            );
            return;
        }
        
        // Show connection overlay
        this.showConnectionOverlay(device, false);
    },
    
    // Connect to a device
    connectDevice: function(device) {
        // Check if already connected
        if (this.isDeviceConnected(device.id)) {
            return;
        }
        
        // Add to connected devices
        this.state.connectedDevices.push({
            ...device,
            isConnected: true,
            connectedAt: new Date()
        });
        
        // Remove from nearby devices
        this.state.nearbyDevices = this.state.nearbyDevices.filter(d => d.id !== device.id);
        
        // Update UI
        this.updateDevicesList('connected-devices', this.state.connectedDevices);
        this.updateDevicesList('nearby-devices', this.state.nearbyDevices);
        
        // If this device has group session enabled, notify
        if (window.TokyoBoxGroupSession && window.TokyoBoxGroupSession.getState().isActive) {
            this.showNotification(
                'Group Session',
                `${device.name} can now join your group session`,
                'users'
            );
        }
    },
    
    // Disconnect a device
    disconnectDevice: function(deviceId) {
        // Find the device
        const device = this.state.connectedDevices.find(d => d.id === deviceId);
        
        if (device) {
            // Remove from connected devices
            this.state.connectedDevices = this.state.connectedDevices.filter(d => d.id !== deviceId);
            
            // Add back to nearby devices with isConnected=false
            device.isConnected = false;
            this.state.nearbyDevices.push(device);
            
            // Update UI
            this.updateDevicesList('connected-devices', this.state.connectedDevices);
            this.updateDevicesList('nearby-devices', this.state.nearbyDevices);
            
            // Show notification
            this.showNotification(
                'Bluetooth',
                `Disconnected from ${device.name}`,
                'bluetooth'
            );
        }
    },
    
    // Check if a device is connected
    isDeviceConnected: function(deviceId) {
        return this.state.connectedDevices.some(d => d.id === deviceId);
    },
    
    // Get all connected devices
    getConnectedDevices: function() {
        return this.state.connectedDevices;
    },
    
    // Show a notification
    showNotification: function(title, message, icon = 'info', type = 'info') {
        // If TokyoBox has a notification system, use it
        if (window.TokyoBox && window.TokyoBox.showNotification) {
            window.TokyoBox.showNotification(message, type);
        } else {
            // Fallback notification system
            const notificationContainer = document.getElementById('notification-container');
            
            if (!notificationContainer) {
                // Create container if it doesn't exist
                const container = document.createElement('div');
                container.id = 'notification-container';
                document.body.appendChild(container);
            }
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div class="notification-icon">
                    <i data-feather="${icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close">
                    <i data-feather="x"></i>
                </button>
            `;
            
            // Add to container
            document.getElementById('notification-container').appendChild(notification);
            
            // Add close button event
            notification.querySelector('.notification-close').addEventListener('click', () => {
                notification.classList.add('closing');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            });
            
            // Refresh icons
            if (window.feather) {
                window.feather.replace();
            }
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.classList.add('closing');
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, 5000);
        }
    },
    
    // Get current state
    getState: function() {
        return { ...this.state };
    }
};