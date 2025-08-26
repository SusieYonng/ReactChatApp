import { WebSocketServer } from 'ws';
import { getSessionUser } from './models/sessions.js';


export class WebSocketManager {
  constructor(server) {
    // Create WebSocket server with CORS support
    this.wss = new WebSocketServer({
      server,
      // Add CORS support
      verifyClient: (info) => {
        console.log('WebSocket connection attempt from:', info.origin);
        console.log('Headers:', info.req.headers);
        // Allow all origins (development only). In production, restrict allowed origins!
        return true;
      }
    });

    this.clients = new Map(); // Map<username, WebSocket>
    this.pendingNotifications = new Map(); // Map<username, Array<notification>>

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  handleConnection(ws, req) {
    console.log('WebSocket connection attempt from:', req.headers.origin);
    console.log('Request URL:', req.url);
    console.log('Cookies:', req.headers.cookie);

    // If no cookies, try to get session from URL params
    let username = null;

    if (req.headers.cookie) {
      // Get session from cookies
      const sidMatch = req.headers.cookie.match(/sid=([^;]+)/);
      if (sidMatch) {
        const sid = sidMatch[1];
        console.log('Session ID found in cookies:', sid);
        username = getSessionUser(sid);
      }
    }

    // If no session in cookies, try to get from URL params
    if (!username && req.url) {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const sessionParam = url.searchParams.get('session');
      if (sessionParam) {
        console.log('Session ID found in URL params:', sessionParam);
        username = getSessionUser(sessionParam);
      }
    }

    // If still no session, try to get from referer header
    if (!username && req.headers.referer) {
      console.log('Checking referer for session:', req.headers.referer);
      // You can add logic here to extract session from referer
    }

    if (!username) {
      console.log('No valid session found, closing connection');
      console.log('Available headers:', Object.keys(req.headers));
      ws.close(1008, 'Authentication required - no valid session');
      return;
    }

    console.log('Username from session:', username);

    // Store client connection
    this.clients.set(username, ws);
    console.log(`User ${username} connected via WebSocket`);
    console.log(`Total connected users: ${this.clients.size}`);
    console.log(`Connected usernames: ${Array.from(this.clients.keys()).join(', ')}`);

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      username: username
    }));

    // Send pending notifications if any
    if (this.pendingNotifications.has(username)) {
      const pending = this.pendingNotifications.get(username);
      console.log(`Sending ${pending.length} pending notifications to ${username}`);

      pending.forEach(notification => {
        try {
          ws.send(JSON.stringify(notification));
          console.log(`Sent pending notification to ${username}:`, notification.type);
        } catch (error) {
          console.error(`Error sending pending notification to ${username}:`, error);
        }
      });

      // Clear pending notifications
      this.pendingNotifications.delete(username);
    }

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(username, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Handle client disconnect
    ws.on('close', (code, reason) => {
      console.log(`User ${username} disconnected from WebSocket: ${code} - ${reason}`);
      this.clients.delete(username);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${username}:`, error);
      this.clients.delete(username);
    });
  }

  handleMessage(username, message) {
    switch (message.type) {
      case 'ping':
        this.sendToUser(username, { type: 'pong' });
        break;
      default:
        console.log(`Unknown message type from ${username}:`, message.type);
    }
  }

  // Send message to specific user
  sendToUser(username, data) {
    // console.log(`Attempting to send message to user: ${username}`);
    // console.log('Message data:', data);
    // console.log('Connected users:', Array.from(this.clients.keys()));

    const client = this.clients.get(username);
    if (client && client.readyState === 1) { // 1 = OPEN
      try {
        client.send(JSON.stringify(data));
        console.log(`Message sent successfully to ${username}`);
      } catch (error) {
        console.error(`Error sending message to ${username}:`, error);
        this.clients.delete(username);
      }
    } else {
      console.log(`User ${username} is not connected or WebSocket is not open`);
      console.log(`Client exists: ${!!client}, readyState: ${client?.readyState}`);

      // Store notification for offline user
      if (!this.pendingNotifications.has(username)) {
        this.pendingNotifications.set(username, []);
      }
      this.pendingNotifications.get(username).push(data);
      console.log(`Stored notification for offline user ${username}. Total pending: ${this.pendingNotifications.get(username).length}`);
    }
  }

  // Broadcast message to all connected clients
  broadcast(data, excludeUsername = null) {
    this.clients.forEach((client, username) => {
      if (username !== excludeUsername && client.readyState === 1) {
        try {
          client.send(JSON.stringify(data));
        } catch (error) {
          console.error(`Error broadcasting to ${username}:`, error);
          this.clients.delete(username);
        }
      }
    });
  }

  // Send new message notification
  sendNewMessageNotification(fromUser, toUser, messageData) {
    console.log(`Sending message notification: from=${fromUser}, to=${toUser}`);
    console.log('Message data:', messageData);

    // Notify sender
    this.sendToUser(fromUser, {
      type: 'new_message',
      direction: 'sent',
      message: messageData
    });

    // Notify recipient
    this.sendToUser(toUser, {
      type: 'new_message',
      direction: 'received',
      message: messageData
    });

    // Log notification status
    console.log(`Notification sent to sender ${fromUser}:`, this.clients.has(fromUser));
    console.log(`Notification sent to recipient ${toUser}:`, this.clients.has(toUser));
  }

  // Send friend request notification
  sendFriendRequestNotification(toUser, fromUser) {
    console.log(`Sending friend request notification: to=${toUser}, from=${fromUser}`);
    this.sendToUser(toUser, {
      type: 'friend_request',
      from: fromUser
    });
  }

  // Send friend request response notification
  sendFriendRequestResponseNotification(toUser, fromUser, status) {
    console.log(`Sending friend request response notification: to=${toUser}, from=${fromUser}, status=${status}`);
    this.sendToUser(toUser, {
      type: 'friend_request_response',
      from: fromUser,
      status: status
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.clients.size;
  }

  // Get list of connected usernames
  getConnectedUsernames() {
    return Array.from(this.clients.keys());
  }

  // Get pending notifications for a user
  getPendingNotifications(username) {
    return this.pendingNotifications.get(username) || [];
  }

  // Get all pending notifications
  getAllPendingNotifications() {
    const result = {};
    this.pendingNotifications.forEach((notifications, username) => {
      result[username] = notifications;
    });
    return result;
  }
}
