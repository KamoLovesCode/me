const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3002 });

// Store connected users with their details
const users = new Map();
const connections = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join':
          // User joins with their name and color
          users.set(data.user, {
            name: data.user,
            color: data.color,
            ws: ws
          });
          connections.set(ws, data.user);
          
          // Broadcast updated user list to all clients
          const userList = Array.from(users.keys());
          const usersWithDetails = Array.from(users.values()).map(u => ({
            name: u.name,
            color: u.color
          }));
          
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'users',
                users: userList,
                usersWithDetails: usersWithDetails
              }));
            }
          });
          console.log(`${data.user} joined with color ${data.color}`);
          break;

        case 'message':
          // Regular message - broadcast to all or specific user
          const messageData = {
            type: 'message',
            from: data.from,
            to: data.to,
            text: data.text,
            time: Date.now()
          };

          if (data.to === 'all') {
            // Broadcast to all users
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageData));
              }
            });
          } else {
            // Send to specific user and sender
            const targetUser = users.get(data.to);
            if (targetUser && targetUser.ws.readyState === WebSocket.OPEN) {
              targetUser.ws.send(JSON.stringify(messageData));
            }
            
            // Also send to sender for confirmation
            const senderUser = users.get(data.from);
            if (senderUser && senderUser.ws.readyState === WebSocket.OPEN) {
              senderUser.ws.send(JSON.stringify(messageData));
            }
          }
          console.log(`Message from ${data.from} to ${data.to}: ${data.text}`);
          break;

        case 'permission-request':
          // Forward permission request to target user
          const targetForPermission = users.get(data.to);
          if (targetForPermission && targetForPermission.ws.readyState === WebSocket.OPEN) {
            targetForPermission.ws.send(JSON.stringify({
              type: 'permission-request',
              from: data.from,
              message: data.text,
              requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }));
          }
          console.log(`Permission request from ${data.from} to ${data.to}`);
          break;

        case 'permission-granted':
          // Forward permission granted back to requester
          const requesterUser = users.get(data.to);
          if (requesterUser && requesterUser.ws.readyState === WebSocket.OPEN) {
            requesterUser.ws.send(JSON.stringify({
              type: 'permission-granted',
              from: data.from,
              requestId: data.requestId
            }));
          }
          console.log(`Permission granted by ${data.from} to ${data.to}`);
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    const userName = connections.get(ws);
    if (userName) {
      users.delete(userName);
      connections.delete(ws);
      
      // Broadcast updated user list
      const userList = Array.from(users.keys());
      const usersWithDetails = Array.from(users.values()).map(u => ({
        name: u.name,
        color: u.color
      }));
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'users',
            users: userList,
            usersWithDetails: usersWithDetails
          }));
        }
      });
      console.log(`${userName} disconnected`);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log('Enhanced Chat WebSocket server running on port 3002');
