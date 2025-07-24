// Peer-to-peer chat system for GitHub Pages
// Uses WebRTC and a simple signaling server alternative

class PeerChatSystem {
    constructor() {
        this.users = new Map();
        this.connections = new Map();
        this.localUser = null;
        this.messageHistory = [];
        this.allowedContacts = new Set();
        this.pendingRequests = new Map();

        // Use localStorage for persistence
        this.storageKey = 'peer-chat-data';
        this.loadFromStorage();

        // Simple broadcast channel for same-origin communication
        this.channel = new BroadcastChannel('peer-chat-channel');
        this.channel.onmessage = this.handleBroadcastMessage.bind(this);
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.messageHistory = data.messageHistory || [];
                this.allowedContacts = new Set(data.allowedContacts || []);
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
    }

    saveToStorage() {
        try {
            const data = {
                messageHistory: this.messageHistory,
                allowedContacts: Array.from(this.allowedContacts)
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    // Join the chat system
    join(user, color, email, phone) {
        this.localUser = { name: user, color, email, phone };

        // Add to users map
        this.users.set(user, {
            name: user,
            color: color,
            email: email,
            phone: phone,
            online: true,
            lastSeen: Date.now()
        });

        // Broadcast join to other tabs/windows
        this.broadcast({
            type: 'user-joined',
            user: this.localUser,
            timestamp: Date.now()
        });

        // Always add admin to allowed contacts
        this.allowedContacts.add('Admin');

        console.log(`${user} joined peer chat system`);
        return this.getOnlineUsers();
    }

    // Get list of online users
    getOnlineUsers() {
        const now = Date.now();
        const onlineUsers = [];

        for (const [name, userData] of this.users.entries()) {
            // Consider users online if seen within last 30 seconds
            if (now - userData.lastSeen < 30000) {
                onlineUsers.push({
                    name: userData.name,
                    color: userData.color,
                    email: userData.email,
                    phone: userData.phone
                });
            }
        }

        // Always include Admin as online
        if (!onlineUsers.find(u => u.name === 'Admin')) {
            onlineUsers.push({
                name: 'Admin',
                color: 'bg-purple-600',
                email: 'admin@kamogelomosia.com',
                phone: '+27 123 456 789'
            });
        }

        return onlineUsers;
    }

    // Send a message
    sendMessage(to, text) {
        if (!this.localUser) return false;

        const message = {
            id: Date.now() + Math.random(),
            from: this.localUser.name,
            to: to,
            text: text,
            time: Date.now(),
            type: 'message'
        };

        // Check permissions for private messages
        if (to !== 'all' && to !== 'Admin' && !this.allowedContacts.has(to)) {
            // Send permission request
            this.requestPermission(to, text);
            return false;
        }

        // Add to message history
        this.messageHistory.push(message);
        this.saveToStorage();

        // Broadcast message
        this.broadcast({
            type: 'new-message',
            message: message
        });

        return true;
    }

    // Request permission to message a user
    requestPermission(to, text) {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.broadcast({
            type: 'permission-request',
            from: this.localUser.name,
            to: to,
            message: text,
            requestId: requestId
        });

        console.log(`Permission request sent to ${to}`);
    }

    // Grant or deny permission
    handlePermissionResponse(from, granted, requestId) {
        if (granted) {
            this.allowedContacts.add(from);
            this.saveToStorage();
        }

        this.broadcast({
            type: 'permission-response',
            from: this.localUser.name,
            to: from,
            granted: granted,
            requestId: requestId
        });
    }

    // Handle broadcast channel messages
    handleBroadcastMessage(event) {
        const data = event.data;

        switch (data.type) {
            case 'user-joined':
                this.users.set(data.user.name, {
                    ...data.user,
                    online: true,
                    lastSeen: data.timestamp
                });
                this.onUsersUpdate?.(this.getOnlineUsers());
                break;

            case 'new-message':
                // Only accept messages intended for us or public messages
                if (data.message.to === 'all' ||
                    data.message.to === this.localUser?.name ||
                    data.message.from === this.localUser?.name) {

                    // Check if we need to show permission dialog
                    if (data.message.to === this.localUser?.name &&
                        data.message.from !== 'Admin' &&
                        !this.allowedContacts.has(data.message.from)) {

                        this.onPermissionRequest?.(data.message.from, data.message.text);
                        return;
                    }

                    this.messageHistory.push(data.message);
                    this.saveToStorage();
                    this.onNewMessage?.(data.message);
                }
                break;

            case 'permission-request':
                if (data.to === this.localUser?.name) {
                    this.onPermissionRequest?.(data.from, data.message, data.requestId);
                }
                break;

            case 'permission-response':
                if (data.to === this.localUser?.name && data.granted) {
                    this.allowedContacts.add(data.from);
                    this.saveToStorage();
                    this.onPermissionGranted?.(data.from);
                }
                break;

            case 'heartbeat':
                if (data.user !== this.localUser?.name) {
                    this.users.set(data.user, {
                        ...this.users.get(data.user),
                        lastSeen: data.timestamp
                    });
                }
                break;
        }
    }

    // Broadcast message to other tabs/windows
    broadcast(data) {
        try {
            this.channel.postMessage(data);
        } catch (error) {
            console.error('Error broadcasting message:', error);
        }
    }

    // Get message history
    getMessages() {
        return this.messageHistory;
    }

    // Start heartbeat to maintain online status
    startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        this.heartbeatInterval = setInterval(() => {
            if (this.localUser) {
                this.broadcast({
                    type: 'heartbeat',
                    user: this.localUser.name,
                    timestamp: Date.now()
                });
            }
        }, 10000); // Every 10 seconds
    }

    // Stop heartbeat
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // Leave the chat system
    leave() {
        this.stopHeartbeat();
        if (this.localUser) {
            this.broadcast({
                type: 'user-left',
                user: this.localUser.name,
                timestamp: Date.now()
            });
        }
        this.localUser = null;
    }

    // Event handlers (to be set by the UI)
    onNewMessage = null;
    onUsersUpdate = null;
    onPermissionRequest = null;
    onPermissionGranted = null;
}

// Export for use in the chat component
if (typeof window !== 'undefined') {
    window.PeerChatSystem = PeerChatSystem;
}

export default PeerChatSystem;
