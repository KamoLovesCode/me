// Simple in-memory chat server using Node.js and 'ws' for WebSocket
// Run this file with: node lib/chat-server.js

const WebSocket = require('ws');
const PORT = 3002;

const wss = new WebSocket.Server({ port: PORT });

let users = {};
let sockets = {};

wss.on('connection', (ws) => {
    let userId = null;

    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg);
            if (data.type === 'join') {
                userId = data.user;
                users[userId] = true;
                sockets[userId] = ws;
                broadcastUsers();
            } else if (data.type === 'message') {
                // Broadcast to all users
                const payload = JSON.stringify({
                    type: 'message',
                    from: data.from,
                    to: data.to,
                    text: data.text,
                    time: Date.now(),
                });
                if (data.to === 'all') {
                    // Send to everyone
                    Object.values(sockets).forEach(sock => sock.send(payload));
                } else if (sockets[data.to]) {
                    // Send to specific user
                    sockets[data.to].send(payload);
                    if (data.from !== data.to && sockets[data.from]) {
                        sockets[data.from].send(payload);
                    }
                }
            }
        } catch (e) { }
    });

    ws.on('close', () => {
        if (userId) {
            delete users[userId];
            delete sockets[userId];
            broadcastUsers();
        }
    });
});

function broadcastUsers() {
    const userList = Object.keys(users);
    const payload = JSON.stringify({ type: 'users', users: userList });
    Object.values(sockets).forEach(sock => sock.send(payload));
}

console.log('Chat server running on ws://localhost:' + PORT);
