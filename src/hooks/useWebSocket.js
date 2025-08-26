import { useEffect, useRef, useCallback, useState } from 'react';
import useAuth from './useAuth.js';

export default function useWebSocket() {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const { username: currentUser } = useAuth();
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [networkStatus, setNetworkStatus] = useState('online');

  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network is online');
      setNetworkStatus('online');
      // If we were disconnected due to network issues, try to reconnect
      if (connectionStatus === 'network_error') {
        setConnectionStatus('reconnecting');
        setTimeout(() => connect(), 1000);
      }
    };

    const handleOffline = () => {
      console.log('Network is offline');
      setNetworkStatus('offline');
      setConnectionStatus('network_error');
    };

    // Listen for network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial network status
    setNetworkStatus(navigator.onLine ? 'online' : 'offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectionStatus]);

  // WebSocket event handlers
  const handleOpen = useCallback(() => {
    console.log('WebSocket connected successfully');
    setIsConnected(true);
    setConnectionStatus('connected');
    reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
    
    // Start ping interval
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
  }, []);

  const handleClose = useCallback((event) => {
    console.log('WebSocket disconnected:', event.code, event.reason);
    setIsConnected(false);
    
    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    // Determine disconnect reason and set appropriate status
    if (event.code === 1000) {
      // Clean close (user logout)
      setConnectionStatus('disconnected');
    } else if (networkStatus === 'offline') {
      // Network is offline
      setConnectionStatus('network_error');
    } else if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      // Attempt to reconnect
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
      
      setConnectionStatus('reconnecting');
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current++;
        connect();
      }, delay);
    } else {
      console.log('Max reconnection attempts reached, giving up');
      setConnectionStatus('failed');
    }
  }, [networkStatus]);

  const handleError = useCallback((error) => {
    console.error('WebSocket error:', error);
    if (networkStatus === 'offline') {
      setConnectionStatus('network_error');
    } else {
      setConnectionStatus('error');
    }
  }, [networkStatus]);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Handle different message types
      switch (data.type) {
        case 'connection':
          console.log('WebSocket connection confirmed for user:', data.username);
          break;
        case 'pong':
          // Ping response received
          break;
        case 'new_message':
          // console.log('New message notification received:', data);
          // Handle new message notification
          if (data.direction === 'received') {
            // Trigger message refresh or update UI
            window.dispatchEvent(new CustomEvent('newMessageReceived', {
              detail: data.message
            }));
          }
          break;
        case 'friend_request':
          console.log('Friend request notification received:', data);
          // Handle friend request notification
          window.dispatchEvent(new CustomEvent('friendRequestReceived', {
            detail: { from: data.from }
          }));
          break;
        case 'friend_request_response':
          console.log('Friend request response notification received:', data);
          // Handle friend request response notification
          window.dispatchEvent(new CustomEvent('friendRequestResponse', {
            detail: { from: data.from, status: data.status }
          }));
          break;
        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!currentUser) {
      console.log('No current user, skipping WebSocket connection');
      return;
    }
    
    if (networkStatus === 'offline') {
      console.log('Network is offline, cannot connect WebSocket');
      setConnectionStatus('network_error');
      return;
    }
    
    try {
      console.log('Attempting to connect to WebSocket...');
      
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Create new WebSocket connection using Vite proxy
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Use proxy path to avoid CORS issues with cookies
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to:', wsUrl);
      console.log('Current origin:', window.location.origin);
      console.log('Current cookies:', document.cookie);
      console.log('Network status:', networkStatus);
      
      wsRef.current = new WebSocket(wsUrl);
      
      // Set up event handlers
      wsRef.current.onopen = handleOpen;
      wsRef.current.onclose = handleClose;
      wsRef.current.onerror = handleError;
      wsRef.current.onmessage = handleMessage;
      
      setConnectionStatus('connecting');
      
      // Add connection timeout
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
          console.log('WebSocket connection timeout, closing connection');
          wsRef.current.close(1000, 'Connection timeout');
        }
      }, 10000); // 10 second timeout
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [currentUser, handleOpen, handleClose, handleError, handleMessage, networkStatus]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    console.log('Disconnecting WebSocket...');
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User logout');
    }
    
    // Clear intervals and timeouts
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    console.log('Manual reconnect requested');
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Send message through WebSocket
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Connect when user is authenticated
  useEffect(() => {
    if (currentUser) {
      console.log('User authenticated, connecting WebSocket...');
      // Add a small delay to ensure session is fully established
      const timer = setTimeout(() => {
        connect();
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      console.log('User not authenticated, disconnecting WebSocket...');
      disconnect();
    }
  }, [currentUser, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    networkStatus,
    sendMessage,
    connect,
    disconnect,
    reconnect
  };
}
