import useWebSocket from '../hooks/useWebSocket.js';
import './WebSocketStatus.css';

export default function WebSocketStatus() {
  const { connectionStatus, networkStatus, reconnect } = useWebSocket();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'green';
      case 'connecting':
        return 'orange';
      case 'reconnecting':
        return 'yellow';
      case 'error':
        return 'red';
      case 'failed':
        return 'darkred';
      case 'network_error':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return '🟢 WebSocket Connected';
      case 'connecting':
        return '🟡 Connecting...';
      case 'reconnecting':
        return '🟡 Reconnecting...';
      case 'error':
        return '🔴 Connection Error';
      case 'failed':
        return '🔴 Connection Failed';
      case 'network_error':
        return '🟣 Network Offline';
      default:
        return '⚪ Disconnected';
    }
  };

  const getConnectionInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Real-time messaging enabled';
      case 'connecting':
        return 'Establishing connection...';
      case 'reconnecting':
        return 'Attempting to reconnect...';
      case 'error':
        return 'Connection error occurred';
      case 'failed':
        return 'Connection failed - click to retry';
      case 'network_error':
        return 'Network is offline - check your connection';
      default:
        return 'Not connected';
    }
  };

  const getNetworkStatusIcon = () => {
    return networkStatus === 'online' ? '🌐' : '📡';
  };

  const getNetworkStatusText = () => {
    return networkStatus === 'online' ? 'Online' : 'Offline';
  };

  if (!import.meta.env.DEV) return null;
  return (
    <div className={`websocket-status ${connectionStatus}`}>
      <div className="status-row">
        <div 
          className="status-indicator"
          style={{ backgroundColor: getStatusColor() }}
        ></div>
        <span className="status-text">{getStatusText()}</span>
        <span className="connection-info">
          {getConnectionInfo()}
        </span>
      </div>
      
      <div className="network-status">
        <span className="network-icon">{getNetworkStatusIcon()}</span>
        <span className="network-text">{getNetworkStatusText()}</span>
      </div>
      
      {connectionStatus === 'failed' && (
        <button 
          className="reconnect-button"
          onClick={reconnect}
          title="Click to manually reconnect"
        >
          🔄 Retry
        </button>
      )}
      
      {connectionStatus === 'network_error' && networkStatus === 'online' && (
        <button 
          className="reconnect-button"
          onClick={reconnect}
          title="Network is back online, click to reconnect"
        >
          🔄 Reconnect
        </button>
      )}
    </div>
  );
}
