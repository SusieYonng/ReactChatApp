import { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket.js';
import './WebSocketDebug.css';

export default function WebSocketDebug() {
  const { connectionStatus, networkStatus, reconnect } = useWebSocket();
  const [debugInfo, setDebugInfo] = useState({
    userAgent: navigator.userAgent,
    cookies: document.cookie,
    location: window.location.href,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        userAgent: navigator.userAgent,
        cookies: document.cookie,
        location: window.location.href,
        timestamp: new Date().toISOString()
      });
    };

    // Update debug info every 5 seconds
    const interval = setInterval(updateDebugInfo, 5000);
    updateDebugInfo(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getNetworkStatusColor = () => {
    return networkStatus === 'online' ? '#28a745' : '#dc3545';
  };

  if (!import.meta.env.DEV) return null;
  return (
    <div className="websocket-debug">
      <h4>🔧 WebSocket Debug Info</h4>
      {/* ...existing code... */}
      <div className="debug-section">
        <strong>Connection Status:</strong> 
        <span style={{ color: connectionStatus === 'connected' ? '#28a745' : '#dc3545' }}>
          {connectionStatus}
        </span>
        {connectionStatus === 'failed' && (
          <button onClick={reconnect} className="debug-reconnect-btn">
            🔄 Retry Connection
          </button>
        )}
      </div>

      <div className="debug-section">
        <strong>Network Status:</strong> 
        <span style={{ color: getNetworkStatusColor() }}>
          {networkStatus === 'online' ? '🌐 Online' : '📡 Offline'}
        </span>
      </div>

      <div className="debug-section">
        <strong>Current URL:</strong> 
        <span className="debug-value" onClick={() => copyToClipboard(debugInfo.location)}>
          {debugInfo.location}
        </span>
      </div>

      <div className="debug-section">
        <strong>Cookies:</strong>
        <span className="debug-value" onClick={() => copyToClipboard(debugInfo.cookies)}>
          {debugInfo.cookies || 'No cookies found'}
        </span>
      </div>

      <div className="debug-section">
        <strong>User Agent:</strong>
        <span className="debug-value" onClick={() => copyToClipboard(debugInfo.userAgent)}>
          {debugInfo.userAgent}
        </span>
      </div>

      <div className="debug-section">
        <strong>Last Updated:</strong> {debugInfo.timestamp}
      </div>

      <div className="debug-tips">
        <h5>💡 Debug Tips:</h5>
        <ul>
          <li>Click on values to copy to clipboard</li>
          <li>Check browser console for WebSocket errors</li>
          <li>Ensure you're logged in before WebSocket connects</li>
          <li>Check if cookies are being sent with requests</li>
          <li>Network status shows if your device is online/offline</li>
          <li>Use browser dev tools to simulate network conditions</li>
        </ul>
      </div>
    </div>
  );
}
