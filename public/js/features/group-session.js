/**
 * Tokyo Box Group Session Functionality
 * Enables synchronized music listening between connected players
 */

// Global namespace for Group Session functionality
window.TokyoBoxGroupSession = {
    // State management
    state: {
        isActive: false,
        sessionId: null,
        sessionCode: null,
        role: null, // 'host', 'dj', or 'listener'
        members: [],
        djMode: false,
        messages: []
    },
    
    // Session roles
    roles: {
        HOST: 'host',
        DJ: 'dj',
        LISTENER: 'listener'
    },
    
    // Initialize Group Session functionality
    init: function() {
        console.log('Initializing Tokyo Box Group Session module...');
        
        // Set up event listeners for UI controls
        this.setupEventListeners();
        
        console.log('Tokyo Box Group Session module initialized successfully');
    },
    
    // Set up event listeners for Group Session controls
    setupEventListeners: function() {
        // Create session button
        const createSessionButton = document.getElementById('create-session');
        if (createSessionButton) {
            createSessionButton.addEventListener('click', () => {
                this.createSession();
            });
        }
        
        // Join session button
        const joinSessionButton = document.getElementById('join-session');
        if (joinSessionButton) {
            joinSessionButton.addEventListener('click', () => {
                const sessionCode = document.getElementById('session-code').value;
                if (sessionCode) {
                    this.joinSession(sessionCode);
                } else {
                    this.showNotification(
                        'Group Session',
                        'Please enter a session code',
                        'users',
                        'error'
                    );
                }
            });
        }
        
        // Leave session button
        const leaveSessionButton = document.getElementById('leave-session');
        if (leaveSessionButton) {
            leaveSessionButton.addEventListener('click', () => {
                this.leaveSession();
            });
        }
        
        // Toggle DJ mode button
        const toggleDjModeButton = document.getElementById('toggle-dj-mode');
        if (toggleDjModeButton) {
            toggleDjModeButton.addEventListener('click', () => {
                this.toggleDjMode(!this.state.djMode);
            });
        }
        
        // Copy session code button
        const copySessionCodeButton = document.getElementById('copy-session-code');
        if (copySessionCodeButton) {
            copySessionCodeButton.addEventListener('click', () => {
                this.copySessionCode();
            });
        }
        
        // Send message button
        const sendMessageButton = document.getElementById('send-message');
        if (sendMessageButton) {
            sendMessageButton.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }
        
        // Enter key in message input
        const chatMessageInput = document.getElementById('chat-message-input');
        if (chatMessageInput) {
            chatMessageInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
        
        // Navigation to Group Session screen
        const groupSessionNavItem = document.getElementById('nav-group-session');
        if (groupSessionNavItem) {
            groupSessionNavItem.addEventListener('click', () => {
                // Update UI with current state when navigating to the screen
                this.updateSessionUI();
            });
        }
    },
    
    // Create a new group session
    createSession: function() {
        // Check if Bluetooth is enabled
        if (window.TokyoBoxBluetooth && !window.TokyoBoxBluetooth.state.isEnabled) {
            this.showNotification(
                'Group Session',
                'Bluetooth must be enabled for group sessions',
                'users',
                'error'
            );
            return;
        }
        
        console.log('Creating a new group session...');
        
        // Generate a random session ID (in a real app, this would come from the server)
        const sessionId = this.generateSessionId();
        
        // Generate a human-readable session code
        const sessionCode = this.generateSessionCode();
        
        // Create the session
        this.state.isActive = true;
        this.state.sessionId = sessionId;
        this.state.sessionCode = sessionCode;
        this.state.role = this.roles.HOST;
        this.state.members = [{
            id: 1, // This would be the user's ID in a real app
            name: 'You (Host)',
            role: this.roles.HOST,
            device: 'This device'
        }];
        this.state.messages = [];
        
        // Show notification
        this.showNotification(
            'Group Session',
            'Session created successfully',
            'users'
        );
        
        // Add a welcome message
        this.addSystemMessage('Group session created. Share the code with others to let them join!');
        
        // Update UI
        this.updateSessionUI();
    },
    
    // Join an existing session
    joinSession: function(sessionCode) {
        // Check if Bluetooth is enabled
        if (window.TokyoBoxBluetooth && !window.TokyoBoxBluetooth.state.isEnabled) {
            this.showNotification(
                'Group Session',
                'Bluetooth must be enabled for group sessions',
                'users',
                'error'
            );
            return;
        }
        
        console.log(`Joining session with code: ${sessionCode}`);
        
        // In a real app, this would verify the session code with the server
        // For demo purposes, we'll accept any code
        
        // Generate a fake session ID (would come from server in real app)
        const sessionId = this.generateSessionId();
        
        // Create existing fake members (would come from server in real app)
        const existingMembers = [
            {
                id: 999, // Host ID
                name: 'Session Host',
                role: this.roles.HOST,
                device: 'Host\'s device'
            }
        ];
        
        // Add 1-3 random members
        const memberCount = Math.floor(Math.random() * 3) + 1;
        const names = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey'];
        
        for (let i = 0; i < memberCount; i++) {
            const nameIndex = Math.floor(Math.random() * names.length);
            const name = names.splice(nameIndex, 1)[0];
            
            existingMembers.push({
                id: 1000 + i,
                name,
                role: Math.random() > 0.8 ? this.roles.DJ : this.roles.LISTENER,
                device: `${name}'s device`
            });
        }
        
        // Join the session
        this.state.isActive = true;
        this.state.sessionId = sessionId;
        this.state.sessionCode = sessionCode;
        this.state.role = this.roles.LISTENER;
        this.state.members = [...existingMembers, {
            id: 1, // This would be the user's ID in a real app
            name: 'You',
            role: this.roles.LISTENER,
            device: 'This device'
        }];
        this.state.messages = [];
        
        // Add welcome messages
        this.addSystemMessage('You joined the group session. Enjoy the music together!');
        this.addMemberMessage(999, 'Welcome to the session!');
        
        // Simulate an existing conversation
        setTimeout(() => {
            const messages = [
                "How is everyone doing?",
                "This song is so good!",
                "Can we play something upbeat next?",
                "I love this playlist!"
            ];
            
            // Add messages from random members
            for (let i = 0; i < 3; i++) {
                const randomMemberId = existingMembers[Math.floor(Math.random() * existingMembers.length)].id;
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                this.addMemberMessage(randomMemberId, randomMessage);
            }
        }, 2000);
        
        // Show notification
        this.showNotification(
            'Group Session',
            'Joined session successfully',
            'users'
        );
        
        // Update UI
        this.updateSessionUI();
    },
    
    // Leave the current session
    leaveSession: function() {
        if (!this.state.isActive) return;
        
        console.log('Leaving group session...');
        
        // Show confirmation based on role
        let confirmMessage = 'Are you sure you want to leave this session?';
        if (this.state.role === this.roles.HOST) {
            confirmMessage = 'As the host, leaving will end the session for everyone. Continue?';
        }
        
        if (confirm(confirmMessage)) {
            // Reset state
            this.state.isActive = false;
            this.state.sessionId = null;
            this.state.sessionCode = null;
            this.state.role = null;
            this.state.members = [];
            this.state.djMode = false;
            this.state.messages = [];
            
            // Show notification
            this.showNotification(
                'Group Session',
                'You left the session',
                'users'
            );
            
            // Update UI
            this.updateSessionUI();
        }
    },
    
    // Toggle DJ mode (for hosts and DJs)
    toggleDjMode: function(enable) {
        if (!this.state.isActive) return;
        
        // Only hosts and DJs can use DJ mode
        if (this.state.role !== this.roles.HOST && this.state.role !== this.roles.DJ) {
            this.showNotification(
                'Group Session',
                'Only hosts and DJs can use DJ mode',
                'users',
                'error'
            );
            return;
        }
        
        console.log(`${enable ? 'Enabling' : 'Disabling'} DJ mode`);
        
        this.state.djMode = enable;
        
        // Show notification
        this.showNotification(
            'Group Session',
            `DJ mode ${enable ? 'enabled' : 'disabled'}`,
            'users'
        );
        
        // Update UI
        this.updateDjModeUI();
        
        // If enabling DJ mode, add a system message
        if (enable) {
            this.addSystemMessage('DJ mode activated! You now control the music for everyone.');
        }
    },
    
    // Copy the session code to clipboard
    copySessionCode: function() {
        if (!this.state.sessionCode) return;
        
        const sessionCode = this.state.sessionCode;
        
        // Try to use the clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(sessionCode)
                .then(() => {
                    this.showNotification(
                        'Group Session',
                        'Session code copied to clipboard',
                        'users'
                    );
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                    this.fallbackCopyToClipboard(sessionCode);
                });
        } else {
            // Fallback for browsers that don't support the clipboard API
            this.fallbackCopyToClipboard(sessionCode);
        }
    },
    
    // Fallback method for copying to clipboard
    fallbackCopyToClipboard: function(text) {
        // Create a temporary input element
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        
        // Try to copy
        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            console.error('Fallback: Could not copy text: ', err);
        }
        
        // Clean up
        document.body.removeChild(input);
        
        // Show result
        if (success) {
            this.showNotification(
                'Group Session',
                'Session code copied to clipboard',
                'users'
            );
        } else {
            this.showNotification(
                'Group Session',
                `Session code: ${text}`,
                'users'
            );
        }
    },
    
    // Send a chat message
    sendChatMessage: function() {
        if (!this.state.isActive) return;
        
        const chatMessageInput = document.getElementById('chat-message-input');
        if (!chatMessageInput) return;
        
        const message = chatMessageInput.value.trim();
        if (!message) return;
        
        console.log(`Sending chat message: ${message}`);
        
        // Add the message to the state
        this.state.messages.push({
            id: Date.now(),
            senderId: 1, // User ID (would be dynamic in a real app)
            senderName: 'You',
            message,
            timestamp: new Date()
        });
        
        // Clear the input
        chatMessageInput.value = '';
        
        // Update the chat UI
        this.updateChatUI();
    },
    
    // Add a system message to the chat
    addSystemMessage: function(message) {
        this.state.messages.push({
            id: Date.now(),
            isSystem: true,
            message,
            timestamp: new Date()
        });
        
        // Update the chat UI
        this.updateChatUI();
    },
    
    // Add a message from another member
    addMemberMessage: function(senderId, message) {
        // Find the member
        const member = this.state.members.find(m => m.id === senderId);
        if (!member) return;
        
        this.state.messages.push({
            id: Date.now(),
            senderId,
            senderName: member.name,
            message,
            timestamp: new Date()
        });
        
        // Update the chat UI
        this.updateChatUI();
    },
    
    // Update the session UI based on current state
    updateSessionUI: function() {
        // Switch between active session view and no session view
        const noSessionView = document.getElementById('no-session-view');
        const activeSessionView = document.getElementById('active-session-view');
        
        if (noSessionView && activeSessionView) {
            if (this.state.isActive) {
                noSessionView.style.display = 'none';
                activeSessionView.style.display = 'block';
            } else {
                noSessionView.style.display = 'block';
                activeSessionView.style.display = 'none';
            }
        }
        
        // Update the session code display
        const sessionCodeElement = document.getElementById('current-session-code');
        if (sessionCodeElement && this.state.sessionCode) {
            sessionCodeElement.textContent = this.state.sessionCode;
        }
        
        // Update user role display
        const userRoleElement = document.getElementById('user-role');
        if (userRoleElement && this.state.role) {
            userRoleElement.textContent = this.state.role.charAt(0).toUpperCase() + this.state.role.slice(1);
        }
        
        // Update DJ controls visibility
        this.updateDjModeUI();
        
        // Update members list
        this.updateMembersUI();
        
        // Update chat messages
        this.updateChatUI();
    },
    
    // Update the DJ mode UI elements
    updateDjModeUI: function() {
        const djControls = document.getElementById('dj-controls');
        if (!djControls) return;
        
        // Only show DJ controls for hosts and DJs
        djControls.style.display = (this.state.role === this.roles.HOST || this.state.role === this.roles.DJ) 
            ? 'block' 
            : 'none';
        
        // Update the DJ mode toggle button text
        const toggleDjModeButton = document.getElementById('toggle-dj-mode');
        if (toggleDjModeButton) {
            toggleDjModeButton.innerHTML = this.state.djMode
                ? '<i data-feather="disc"></i> Disable DJ Mode'
                : '<i data-feather="disc"></i> Enable DJ Mode';
            
            // Refresh icons
            if (window.feather) {
                window.feather.replace();
            }
        }
    },
    
    // Update the members list UI
    updateMembersUI: function() {
        const membersListElement = document.getElementById('session-members-list');
        if (!membersListElement) return;
        
        // Clear the list
        membersListElement.innerHTML = '';
        
        // If no members, show empty message
        if (this.state.members.length === 0) {
            membersListElement.innerHTML = '<div class="empty-list-message">No members yet</div>';
            return;
        }
        
        // Add each member to the list
        this.state.members.forEach(member => {
            const memberElement = document.createElement('div');
            memberElement.className = 'member-item';
            
            // Different icons based on role
            let roleIcon = 'user';
            if (member.role === this.roles.HOST) {
                roleIcon = 'crown';
            } else if (member.role === this.roles.DJ) {
                roleIcon = 'disc';
            }
            
            memberElement.innerHTML = `
                <div class="member-icon">
                    <i data-feather="${roleIcon}"></i>
                </div>
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-device">${member.device}</div>
                </div>
                <div class="member-role ${member.role}">
                    ${member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </div>
            `;
            
            membersListElement.appendChild(memberElement);
        });
        
        // Refresh icons
        if (window.feather) {
            window.feather.replace();
        }
    },
    
    // Update the chat UI
    updateChatUI: function() {
        const chatMessagesElement = document.getElementById('chat-messages');
        if (!chatMessagesElement) return;
        
        // Clear the messages
        chatMessagesElement.innerHTML = '';
        
        // Add each message to the chat
        this.state.messages.forEach(message => {
            const messageElement = document.createElement('div');
            
            if (message.isSystem) {
                // System message
                messageElement.className = 'system-message';
                messageElement.innerHTML = `
                    <div class="message-content">${message.message}</div>
                `;
            } else if (message.senderId === 1) {
                // User's own message
                messageElement.className = 'user-message';
                messageElement.innerHTML = `
                    <div class="message-content">${message.message}</div>
                    <div class="message-timestamp">${this.formatTimestamp(message.timestamp)}</div>
                `;
            } else {
                // Other member's message
                messageElement.className = 'member-message';
                messageElement.innerHTML = `
                    <div class="message-sender">${message.senderName}</div>
                    <div class="message-content">${message.message}</div>
                    <div class="message-timestamp">${this.formatTimestamp(message.timestamp)}</div>
                `;
            }
            
            chatMessagesElement.appendChild(messageElement);
        });
        
        // Scroll to the bottom
        chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
    },
    
    // Format a timestamp for display
    formatTimestamp: function(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    },
    
    // Generate a random session ID
    generateSessionId: function() {
        return Date.now().toString() + Math.floor(Math.random() * 1000000).toString();
    },
    
    // Generate a human-readable session code
    generateSessionCode: function() {
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
        let code = '';
        
        // Generate 6-character code
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        // Add hyphens for readability
        return code.slice(0, 3) + '-' + code.slice(3);
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