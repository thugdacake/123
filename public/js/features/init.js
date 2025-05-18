/**
 * Tokyo Box Feature Initialization
 * This script initializes all enhanced features and integrates them with the core player
 */

// Create a global event for features readiness
const featureReadyEvent = new CustomEvent('tokyo:featuresReady');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Tokyo Box enhanced features...');
    
    // Create feature screens in the UI
    createFeatureScreens();
    
    // Add navigation elements for new features
    addFeatureNavigation();
    
    // Initialize feature components in sequence
    initializeBluetooth()
        .then(initializeAudioEffects)
        .then(initializeGroupSessions)
        .then(() => {
            console.log('All Tokyo Box features initialized successfully');
            // Dispatch the ready event
            document.dispatchEvent(featureReadyEvent);
        })
        .catch(error => {
            console.error('Error initializing Tokyo Box features:', error);
        });
});

/**
 * Creates the HTML elements for feature screens
 */
function createFeatureScreens() {
    const phoneContainer = document.querySelector('.phone-container');
    if (!phoneContainer) {
        console.error('Phone container not found, cannot create feature screens');
        return;
    }

    // Create HTML for Bluetooth screen
    const bluetoothScreen = document.createElement('div');
    bluetoothScreen.id = 'bluetooth-screen';
    bluetoothScreen.className = 'screen';
    bluetoothScreen.innerHTML = `
        <div class="screen-header">
            <h2><i data-feather="bluetooth"></i> Bluetooth</h2>
        </div>
        <div class="screen-content">
            <div class="settings-section">
                <div class="setting-row">
                    <span>Bluetooth</span>
                    <label class="toggle">
                        <input type="checkbox" id="bluetooth-toggle">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="setting-row">
                    <span>Discoverable</span>
                    <label class="toggle">
                        <input type="checkbox" id="discoverable-toggle">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="setting-row">
                    <span>Auto-accept connections</span>
                    <label class="toggle">
                        <input type="checkbox" id="auto-accept-toggle">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="setting-row">
                    <span>Bluetooth range</span>
                    <input type="range" id="bluetooth-range" min="10" max="100" value="50">
                    <span id="bluetooth-range-value">50m</span>
                </div>
            </div>
            
            <div class="devices-section">
                <h3>Connected Devices</h3>
                <div id="connected-devices" class="device-list">
                    <!-- Connected devices will be added here -->
                    <div class="empty-list-message">No connected devices</div>
                </div>
                
                <div class="divider"></div>
                
                <h3>Nearby Devices</h3>
                <button id="refresh-devices" class="btn btn-secondary">
                    <i data-feather="refresh-cw"></i> Refresh
                </button>
                <div id="nearby-devices" class="device-list">
                    <!-- Nearby devices will be added here -->
                    <div class="empty-list-message">No devices found</div>
                </div>
            </div>
        </div>
    `;
    
    // Create HTML for 3D Audio screen
    const audioEffectsScreen = document.createElement('div');
    audioEffectsScreen.id = 'equalizer-screen';
    audioEffectsScreen.className = 'screen';
    audioEffectsScreen.innerHTML = `
        <div class="screen-header">
            <h2><i data-feather="sliders"></i> Equalizer & 3D Audio</h2>
        </div>
        <div class="screen-content">
            <div class="equalizer-section">
                <div class="preset-selector">
                    <select id="eq-preset-select">
                        <option value="flat">Flat</option>
                        <option value="rock">Rock</option>
                        <option value="pop">Pop</option>
                        <option value="jazz">Jazz</option>
                        <option value="electronic">Electronic</option>
                        <option value="classical">Classical</option>
                        <option value="hip-hop">Hip-Hop</option>
                        <option value="custom">Custom</option>
                    </select>
                    <button id="save-preset" class="btn btn-secondary">
                        <i data-feather="save"></i> Save
                    </button>
                </div>
                
                <div class="eq-bands" id="eq-bands">
                    <!-- EQ bands will be added here by JavaScript -->
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="spatial-audio-section">
                <h3>3D Audio Effects</h3>
                
                <div class="setting-row">
                    <span>Enable 3D Audio</span>
                    <label class="toggle">
                        <input type="checkbox" id="spatial-toggle">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                
                <div class="setting-row">
                    <span>Room Size</span>
                    <input type="range" id="room-size" min="0" max="100" value="50">
                </div>
                
                <div class="setting-row">
                    <span>Reverb</span>
                    <input type="range" id="reverb-level" min="0" max="100" value="30">
                </div>
                
                <div class="position-control">
                    <h4>Sound Position</h4>
                    <div class="position-visualizer" id="position-visualizer">
                        <div class="position-marker" id="position-marker"></div>
                        <div class="position-listener"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Create HTML for Group Session screen
    const groupSessionScreen = document.createElement('div');
    groupSessionScreen.id = 'group-session-screen';
    groupSessionScreen.className = 'screen';
    groupSessionScreen.innerHTML = `
        <div class="screen-header">
            <h2><i data-feather="users"></i> Group Session</h2>
        </div>
        <div class="screen-content">
            <div class="session-controls">
                <div id="no-session-view">
                    <button id="create-session" class="btn btn-primary">
                        <i data-feather="plus"></i> Create Session
                    </button>
                    <div class="divider-text">or</div>
                    <div class="join-section">
                        <input type="text" id="session-code" placeholder="Enter session code">
                        <button id="join-session" class="btn btn-secondary">
                            <i data-feather="log-in"></i> Join
                        </button>
                    </div>
                </div>
                
                <div id="active-session-view" style="display: none;">
                    <div class="session-info">
                        <h3>Active Session</h3>
                        <div class="session-code-display">
                            <span>Session Code: </span>
                            <span id="current-session-code" class="code"></span>
                            <button id="copy-session-code" class="btn btn-icon">
                                <i data-feather="copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="session-role">
                        <span>Your Role: </span>
                        <span id="user-role">Host</span>
                        <div id="dj-controls" style="display: none;">
                            <button id="toggle-dj-mode" class="btn btn-secondary">
                                <i data-feather="disc"></i> Toggle DJ Mode
                            </button>
                        </div>
                    </div>
                    
                    <button id="leave-session" class="btn btn-danger">
                        <i data-feather="log-out"></i> Leave Session
                    </button>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="session-members">
                <h3>Members</h3>
                <div id="session-members-list" class="members-list">
                    <!-- Session members will be added here -->
                    <div class="empty-list-message">No members yet</div>
                </div>
            </div>
            
            <div class="session-chat">
                <h3>Session Chat</h3>
                <div id="chat-messages" class="chat-messages">
                    <!-- Chat messages will be displayed here -->
                </div>
                <div class="chat-input">
                    <input type="text" id="chat-message-input" placeholder="Type a message...">
                    <button id="send-message" class="btn btn-icon">
                        <i data-feather="send"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Append all screens to the phone container
    phoneContainer.appendChild(bluetoothScreen);
    phoneContainer.appendChild(audioEffectsScreen);
    phoneContainer.appendChild(groupSessionScreen);
    
    // Refresh icons
    if (window.feather) {
        window.feather.replace();
    }
}

/**
 * Adds the navigation elements for new features
 */
function addFeatureNavigation() {
    const navBar = document.querySelector('.nav-bar');
    if (!navBar) {
        console.error('Navigation bar not found, cannot add feature navigation');
        return;
    }
    
    // Create Bluetooth navigation item
    const bluetoothNavItem = document.createElement('div');
    bluetoothNavItem.id = 'nav-bluetooth';
    bluetoothNavItem.className = 'nav-item';
    bluetoothNavItem.innerHTML = `
        <i data-feather="bluetooth"></i>
        <span>Bluetooth</span>
    `;
    
    // Create Equalizer navigation item
    const equalizerNavItem = document.createElement('div');
    equalizerNavItem.id = 'nav-equalizer';
    equalizerNavItem.className = 'nav-item';
    equalizerNavItem.innerHTML = `
        <i data-feather="sliders"></i>
        <span>Equalizer</span>
    `;
    
    // Create Group Session navigation item
    const groupSessionNavItem = document.createElement('div');
    groupSessionNavItem.id = 'nav-group-session';
    groupSessionNavItem.className = 'nav-item';
    groupSessionNavItem.innerHTML = `
        <i data-feather="users"></i>
        <span>Group</span>
    `;
    
    // Add the new navigation items to the navigation bar
    navBar.appendChild(bluetoothNavItem);
    navBar.appendChild(equalizerNavItem);
    navBar.appendChild(groupSessionNavItem);
    
    // Refresh icons
    if (window.feather) {
        window.feather.replace();
    }
}

/**
 * Initializes the Bluetooth functionality
 */
function initializeBluetooth() {
    return new Promise((resolve) => {
        console.log('Initializing Bluetooth functionality...');
        
        // If the Bluetooth script is loaded, continue
        if (window.TokyoBoxBluetooth && typeof window.TokyoBoxBluetooth.init === 'function') {
            window.TokyoBoxBluetooth.init();
            resolve();
        } else {
            // Wait for the script to load
            const checkInterval = setInterval(() => {
                if (window.TokyoBoxBluetooth && typeof window.TokyoBoxBluetooth.init === 'function') {
                    clearInterval(checkInterval);
                    window.TokyoBoxBluetooth.init();
                    resolve();
                }
            }, 100);
            
            // Fallback timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('Bluetooth initialization timed out');
                resolve();
            }, 5000);
        }
    });
}

/**
 * Initializes the 3D audio effects functionality
 */
function initializeAudioEffects() {
    return new Promise((resolve) => {
        console.log('Initializing 3D audio effects...');
        
        // If the 3D audio script is loaded, continue
        if (window.TokyoBox3DAudio && typeof window.TokyoBox3DAudio.init === 'function') {
            window.TokyoBox3DAudio.init();
            resolve();
        } else {
            // Wait for the script to load
            const checkInterval = setInterval(() => {
                if (window.TokyoBox3DAudio && typeof window.TokyoBox3DAudio.init === 'function') {
                    clearInterval(checkInterval);
                    window.TokyoBox3DAudio.init();
                    resolve();
                }
            }, 100);
            
            // Fallback timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('3D audio initialization timed out');
                resolve();
            }, 5000);
        }
    });
}

/**
 * Initializes the group session functionality
 */
function initializeGroupSessions() {
    return new Promise((resolve) => {
        console.log('Initializing group session functionality...');
        
        // If the group session script is loaded, continue
        if (window.TokyoBoxGroupSession && typeof window.TokyoBoxGroupSession.init === 'function') {
            window.TokyoBoxGroupSession.init();
            resolve();
        } else {
            // Wait for the script to load
            const checkInterval = setInterval(() => {
                if (window.TokyoBoxGroupSession && typeof window.TokyoBoxGroupSession.init === 'function') {
                    clearInterval(checkInterval);
                    window.TokyoBoxGroupSession.init();
                    resolve();
                }
            }, 100);
            
            // Fallback timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('Group session initialization timed out');
                resolve();
            }, 5000);
        }
    });
}