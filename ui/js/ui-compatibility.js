/**
 * Tokyo Box UI Compatibility Script
 * Ensures that all UI controls work properly with the enhanced features
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for the Tokyo Box to be initialized
    document.addEventListener('tokyo:featuresReady', function() {
        console.log('Enhanced features ready, setting up UI compatibility');
        setupUICompatibility();
    });
});

function setupUICompatibility() {
    // Fix close button functionality
    const closeButton = document.getElementById('close-app');
    if (closeButton) {
        const originalClickHandler = closeButton.onclick;
        
        closeButton.onclick = function(e) {
            console.log('Close button clicked');
            
            // Call the original handler if it exists
            if (typeof originalClickHandler === 'function') {
                originalClickHandler.call(this, e);
            }
            
            // Additional cleanup for enhanced features
            try {
                // Disconnect from any Bluetooth devices
                if (window.TokyoBoxBluetooth) {
                    const state = window.TokyoBoxBluetooth.getState();
                    if (state.isEnabled && state.connectedDevices.length > 0) {
                        state.connectedDevices.forEach(device => {
                            window.TokyoBoxBluetooth.disconnect(device.id);
                        });
                    }
                }
                
                // Leave any active group sessions
                if (window.TokyoBoxGroupSession) {
                    const sessionState = window.TokyoBoxGroupSession.getState();
                    if (sessionState.isActive) {
                        window.TokyoBoxGroupSession.leave();
                    }
                }
                
                // Close the Tokyo Box UI
                if (window.TokyoBox && window.TokyoBox.closeUI) {
                    window.TokyoBox.closeUI();
                } else {
                    // Fallback if the TokyoBox closeUI method is not available
                    const appContainer = document.getElementById('tokyo-box-app');
                    if (appContainer) {
                        appContainer.classList.add('hide');
                    }
                    
                    // Also attempt to send NUI message for FiveM
                    try {
                        fetch('https://tokyo_box/closeUI', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({})
                        });
                    } catch (err) {
                        console.log('Not in FiveM context, closing locally only');
                    }
                }
            } catch (err) {
                console.error('Error during close operation:', err);
            }
        };
    }
    
    // Make sure navigation buttons work with new screens
    const navBar = document.querySelector('.nav-bar');
    if (navBar) {
        // Get all the original nav buttons
        const originalNavButtons = Array.from(navBar.querySelectorAll('.nav-item')).filter(btn => 
            btn.id === 'nav-home' || 
            btn.id === 'nav-search' || 
            btn.id === 'nav-library'
        );
        
        // Get our new feature nav buttons
        const featureNavButtons = Array.from(navBar.querySelectorAll('.nav-item')).filter(btn => 
            btn.id === 'nav-bluetooth' || 
            btn.id === 'nav-equalizer' || 
            btn.id === 'nav-group-session'
        );
        
        // Setup original nav buttons
        originalNavButtons.forEach(button => {
            const screenName = button.id.replace('nav-', '');
            
            // Keep original click handler but add support for our new screens
            button.addEventListener('click', function() {
                // Deactivate all screens
                document.querySelectorAll('.screen').forEach(screen => {
                    screen.classList.remove('active');
                });
                
                // Deactivate all nav buttons
                document.querySelectorAll('.nav-item').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Activate this button
                this.classList.add('active');
                
                // Activate the corresponding screen
                const screen = document.getElementById(`${screenName}-screen`);
                if (screen) {
                    screen.classList.add('active');
                }
            });
        });
        
        // Setup feature nav buttons
        featureNavButtons.forEach(button => {
            const screenName = button.id.replace('nav-', '');
            
            button.addEventListener('click', function() {
                // Deactivate all screens
                document.querySelectorAll('.screen').forEach(screen => {
                    screen.classList.remove('active');
                });
                
                // Deactivate all nav buttons
                document.querySelectorAll('.nav-item').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Activate this button
                this.classList.add('active');
                
                // Activate the corresponding screen
                const screen = document.getElementById(`${screenName}-screen`);
                if (screen) {
                    screen.classList.add('active');
                }
            });
        });
    }
    
    // Fix any broken links or buttons
    fixBrokenControls();
}

function fixBrokenControls() {
    // Ensure the mini player expands when clicked
    const miniPlayer = document.querySelector('.mini-player');
    if (miniPlayer) {
        miniPlayer.addEventListener('click', function(e) {
            // Only expand if not clicking a control button
            if (!e.target.closest('.player-controls')) {
                const fullPlayer = document.querySelector('.full-player');
                if (fullPlayer) {
                    fullPlayer.classList.add('active');
                }
            }
        });
    }
    
    // Ensure the minimize button works
    const minimizeButton = document.getElementById('minimize-player');
    if (minimizeButton) {
        minimizeButton.addEventListener('click', function() {
            const fullPlayer = document.querySelector('.full-player');
            if (fullPlayer) {
                fullPlayer.classList.remove('active');
            }
        });
    }
    
    // Fix modal close buttons
    const modalCloseButtons = document.querySelectorAll('[id$="-modal"] .btn-icon, [id$="-modal"] .btn-secondary');
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find the parent modal
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Make sure all buttons have appropriate hover effects
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        if (!button.classList.contains('no-hover')) {
            button.addEventListener('mouseenter', function() {
                this.style.opacity = '0.8';
            });
            button.addEventListener('mouseleave', function() {
                this.style.opacity = '1';
            });
        }
    });
}

// Call this function to reload all Feather icons (usually after dynamically adding content)
function refreshIcons() {
    if (window.feather) {
        window.feather.replace();
    }
}

// Make sure the icons are refreshed when needed
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if any of the added nodes contain feather icons
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && (
                    node.getAttribute('data-feather') || 
                    node.querySelector('[data-feather]')
                )) {
                    refreshIcons();
                }
            });
        }
    });
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

// Export to window object for global access
window.TokyoBoxUICompat = {
    refreshIcons,
    fixBrokenControls
};