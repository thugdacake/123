/**
 * Tokyo Box 3D Audio Effects Module
 * Provides spatial audio effects and equalizer functionality
 */

// Global namespace for 3D Audio functionality
window.TokyoBox3DAudio = {
    // State management
    state: {
        equalizerEnabled: false,
        spatialAudioEnabled: false,
        currentPreset: 'flat',
        customPreset: null,
        roomSize: 50,
        reverbLevel: 30,
        position: { x: 0, y: 0 } // center coordinates
    },
    
    // Equalizer band definitions
    bands: [
        { freq: '32', value: 0, display: '32Hz' },
        { freq: '64', value: 0, display: '64Hz' },
        { freq: '125', value: 0, display: '125Hz' },
        { freq: '250', value: 0, display: '250Hz' },
        { freq: '500', value: 0, display: '500Hz' },
        { freq: '1k', value: 0, display: '1kHz' },
        { freq: '2k', value: 0, display: '2kHz' },
        { freq: '4k', value: 0, display: '4kHz' },
        { freq: '8k', value: 0, display: '8kHz' },
        { freq: '16k', value: 0, display: '16kHz' }
    ],
    
    // Preset EQ configurations
    presets: {
        flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        rock: [4, 3, 2, 0, -1, -1, 0, 2, 3, 4],
        pop: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2],
        jazz: [3, 2, 1, 2, -2, -2, 0, 1, 2, 3],
        electronic: [4, 3, 0, -2, -4, -4, -2, 0, 3, 4],
        classical: [3, 2, 1, 0, 0, 0, 0, 1, 2, 3],
        'hip-hop': [4, 4, 2, 0, -2, -1, 0, 1, 3, 2]
    },
    
    // Initialize 3D Audio functionality
    init: function() {
        console.log('Initializing Tokyo Box 3D Audio module...');
        
        // Set up the EQ bands in the UI
        this.setupEQBands();
        
        // Set up the position visualizer
        this.setupPositionVisualizer();
        
        // Set up event listeners for audio controls
        this.setupEventListeners();
        
        // Initialize with flat preset
        this.applyPreset('flat');
        
        console.log('Tokyo Box 3D Audio module initialized successfully');
    },
    
    // Create the EQ band sliders in the UI
    setupEQBands: function() {
        const eqBandsContainer = document.getElementById('eq-bands');
        if (!eqBandsContainer) return;
        
        // Clear existing content
        eqBandsContainer.innerHTML = '';
        
        // Add each EQ band
        this.bands.forEach((band, index) => {
            const bandElement = document.createElement('div');
            bandElement.className = 'eq-band';
            bandElement.innerHTML = `
                <div class="band-slider">
                    <input type="range" min="-12" max="12" value="${band.value}" 
                           class="eq-slider" data-band="${index}">
                    <div class="band-value">${band.value > 0 ? '+' : ''}${band.value} dB</div>
                </div>
                <div class="band-freq">${band.display}</div>
            `;
            
            eqBandsContainer.appendChild(bandElement);
            
            // Add event listener to the slider
            const slider = bandElement.querySelector('.eq-slider');
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.bands[index].value = value;
                bandElement.querySelector('.band-value').textContent = `${value > 0 ? '+' : ''}${value} dB`;
                
                // If changing values, set preset to custom
                this.state.currentPreset = 'custom';
                this.state.customPreset = this.bands.map(band => band.value);
                
                const presetSelect = document.getElementById('eq-preset-select');
                if (presetSelect) {
                    presetSelect.value = 'custom';
                }
                
                // Apply the changes to audio
                this.applyEQ();
            });
        });
    },
    
    // Set up the position visualizer for 3D audio
    setupPositionVisualizer: function() {
        const visualizer = document.getElementById('position-visualizer');
        const marker = document.getElementById('position-marker');
        
        if (!visualizer || !marker) return;
        
        // Position the marker at the initial position
        this.updateMarkerPosition();
        
        // Add drag functionality
        let isDragging = false;
        
        marker.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault(); // Prevent text selection
        });
        
        visualizer.addEventListener('mousedown', (e) => {
            // Only if clicking directly on the visualizer (not on marker)
            if (e.target === visualizer) {
                const rect = visualizer.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
                const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
                
                this.state.position = { x, y };
                this.updateMarkerPosition();
                this.applySpatialAudio();
                
                isDragging = true;
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = visualizer.getBoundingClientRect();
            let x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
            let y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
            
            // Constrain values to the visualizer boundaries
            x = Math.max(-1, Math.min(1, x));
            y = Math.max(-1, Math.min(1, y));
            
            this.state.position = { x, y };
            this.updateMarkerPosition();
            this.applySpatialAudio();
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Mobile touch support
        marker.addEventListener('touchstart', (e) => {
            isDragging = true;
            e.preventDefault(); // Prevent scrolling
        });
        
        visualizer.addEventListener('touchstart', (e) => {
            if (e.target === visualizer) {
                const rect = visualizer.getBoundingClientRect();
                const touch = e.touches[0];
                const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
                const y = ((touch.clientY - rect.top) / rect.height) * 2 - 1;
                
                this.state.position = { x, y };
                this.updateMarkerPosition();
                this.applySpatialAudio();
                
                isDragging = true;
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const rect = visualizer.getBoundingClientRect();
            const touch = e.touches[0];
            let x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            let y = ((touch.clientY - rect.top) / rect.height) * 2 - 1;
            
            // Constrain values
            x = Math.max(-1, Math.min(1, x));
            y = Math.max(-1, Math.min(1, y));
            
            this.state.position = { x, y };
            this.updateMarkerPosition();
            this.applySpatialAudio();
            
            e.preventDefault(); // Prevent scrolling
        });
        
        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    },
    
    // Update the position marker in the visualizer
    updateMarkerPosition: function() {
        const marker = document.getElementById('position-marker');
        if (!marker) return;
        
        const x = this.state.position.x;
        const y = this.state.position.y;
        
        // Convert from -1,1 to percentages
        const left = ((x + 1) / 2) * 100;
        const top = ((y + 1) / 2) * 100;
        
        marker.style.left = `${left}%`;
        marker.style.top = `${top}%`;
    },
    
    // Set up event listeners for audio control elements
    setupEventListeners: function() {
        // EQ preset selector
        const presetSelect = document.getElementById('eq-preset-select');
        if (presetSelect) {
            presetSelect.addEventListener('change', () => {
                const preset = presetSelect.value;
                this.applyPreset(preset);
            });
        }
        
        // Save preset button
        const savePresetButton = document.getElementById('save-preset');
        if (savePresetButton) {
            savePresetButton.addEventListener('click', () => {
                this.saveCustomPreset();
            });
        }
        
        // 3D Audio toggle
        const spatialToggle = document.getElementById('spatial-toggle');
        if (spatialToggle) {
            spatialToggle.addEventListener('change', () => {
                this.toggleSpatialAudio(spatialToggle.checked);
            });
        }
        
        // Room size slider
        const roomSizeSlider = document.getElementById('room-size');
        if (roomSizeSlider) {
            roomSizeSlider.addEventListener('input', () => {
                this.setRoomSize(parseInt(roomSizeSlider.value));
            });
        }
        
        // Reverb level slider
        const reverbLevelSlider = document.getElementById('reverb-level');
        if (reverbLevelSlider) {
            reverbLevelSlider.addEventListener('input', () => {
                this.setReverbLevel(parseInt(reverbLevelSlider.value));
            });
        }
        
        // Navigation to Equalizer screen
        const equalizerNavItem = document.getElementById('nav-equalizer');
        if (equalizerNavItem) {
            equalizerNavItem.addEventListener('click', () => {
                // Update UI with current state when navigating to the screen
                this.updateEQUI();
            });
        }
    },
    
    // Apply an EQ preset
    applyPreset: function(presetName) {
        if (presetName === 'custom' && this.state.customPreset) {
            // Apply custom preset if available
            this.state.currentPreset = 'custom';
            this.bands.forEach((band, i) => {
                band.value = this.state.customPreset[i];
            });
        } else if (this.presets[presetName]) {
            // Apply built-in preset
            this.state.currentPreset = presetName;
            this.bands.forEach((band, i) => {
                band.value = this.presets[presetName][i];
            });
        } else {
            console.error(`Preset "${presetName}" not found`);
            return;
        }
        
        // Update UI to reflect the new values
        this.updateEQUI();
        
        // Apply the EQ settings
        this.applyEQ();
        
        // Show notification for built-in presets
        if (presetName !== 'custom') {
            this.showNotification(
                'Equalizer',
                `Applied "${presetName}" preset`,
                'sliders'
            );
        }
    },
    
    // Save the current EQ settings as a custom preset
    saveCustomPreset: function() {
        // Save the current band values
        this.state.customPreset = this.bands.map(band => band.value);
        this.state.currentPreset = 'custom';
        
        // Update preset selector
        const presetSelect = document.getElementById('eq-preset-select');
        if (presetSelect) {
            presetSelect.value = 'custom';
        }
        
        // Show notification
        this.showNotification(
            'Equalizer',
            'Custom preset saved',
            'save'
        );
    },
    
    // Toggle 3D spatial audio
    toggleSpatialAudio: function(enable) {
        this.state.spatialAudioEnabled = enable;
        console.log(`3D Audio ${enable ? 'enabled' : 'disabled'}`);
        
        // Apply spatial audio settings
        this.applySpatialAudio();
        
        // Show notification
        this.showNotification(
            '3D Audio',
            `3D Audio effects ${enable ? 'enabled' : 'disabled'}`,
            'speaker'
        );
    },
    
    // Set room size for reverb
    setRoomSize: function(size) {
        this.state.roomSize = size;
        
        // Apply the changes
        this.applySpatialAudio();
    },
    
    // Set reverb level
    setReverbLevel: function(level) {
        this.state.reverbLevel = level;
        
        // Apply the changes
        this.applySpatialAudio();
    },
    
    // Apply the current EQ settings to the audio
    applyEQ: function() {
        // Log the current EQ values (for debugging)
        console.log('Applying EQ:', this.bands.map(band => band.value));
        
        // If there's a Web Audio API context, apply EQ
        // For now, we're just simulating this
        
        // If TokyoBox has audio visualizer, update its EQ settings
        if (window.TokyoBox && window.TokyoBox.updateAudioVisualizerEQ) {
            window.TokyoBox.updateAudioVisualizerEQ(this.bands.map(band => band.value));
        }
        
        // Send EQ settings to FiveM if available
        if (window.TokyoBox && window.TokyoBox.sendNUICallback) {
            window.TokyoBox.sendNUICallback('setEQ', {
                bands: this.bands.map(band => band.value)
            });
        }
    },
    
    // Apply spatial audio settings
    applySpatialAudio: function() {
        // Only apply if spatial audio is enabled
        if (!this.state.spatialAudioEnabled) return;
        
        // Log spatial audio parameters (for debugging)
        console.log('Applying spatial audio:', {
            position: this.state.position,
            roomSize: this.state.roomSize,
            reverbLevel: this.state.reverbLevel
        });
        
        // If there's a Web Audio API context, apply spatial audio
        // For now, we're just simulating this
        
        // Send spatial audio settings to FiveM if available
        if (window.TokyoBox && window.TokyoBox.sendNUICallback) {
            window.TokyoBox.sendNUICallback('setSpatialAudio', {
                enabled: this.state.spatialAudioEnabled,
                position: this.state.position,
                roomSize: this.state.roomSize,
                reverbLevel: this.state.reverbLevel
            });
        }
    },
    
    // Update the EQ UI to reflect the current settings
    updateEQUI: function() {
        // Update band sliders
        this.bands.forEach((band, index) => {
            const slider = document.querySelector(`.eq-slider[data-band="${index}"]`);
            const valueDisplay = slider?.closest('.band-slider')?.querySelector('.band-value');
            
            if (slider && valueDisplay) {
                slider.value = band.value;
                valueDisplay.textContent = `${band.value > 0 ? '+' : ''}${band.value} dB`;
            }
        });
        
        // Update preset selector
        const presetSelect = document.getElementById('eq-preset-select');
        if (presetSelect) {
            presetSelect.value = this.state.currentPreset;
        }
        
        // Update 3D audio controls
        const spatialToggle = document.getElementById('spatial-toggle');
        if (spatialToggle) {
            spatialToggle.checked = this.state.spatialAudioEnabled;
        }
        
        const roomSizeSlider = document.getElementById('room-size');
        if (roomSizeSlider) {
            roomSizeSlider.value = this.state.roomSize;
        }
        
        const reverbLevelSlider = document.getElementById('reverb-level');
        if (reverbLevelSlider) {
            reverbLevelSlider.value = this.state.reverbLevel;
        }
    },
    
    // Show a notification
    showNotification: function(title, message, icon = 'info', type = 'info') {
        // If TokyoBox has a notification system, use it
        if (window.TokyoBox && window.TokyoBox.showNotification) {
            window.TokyoBox.showNotification(message, type);
        } else if (window.TokyoBoxBluetooth && window.TokyoBoxBluetooth.showNotification) {
            // Use Bluetooth module's notification if available
            window.TokyoBoxBluetooth.showNotification(title, message, icon, type);
        } else {
            // Fallback: log to console
            console.log(`${title}: ${message}`);
        }
    },
    
    // Get current state
    getState: function() {
        return { ...this.state };
    }
};