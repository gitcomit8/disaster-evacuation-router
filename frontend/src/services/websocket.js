import io from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    this.socket = io(WS_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      this.emit('disconnected');
    });

    // Proxy all socket events to listeners
    this.socket.on('state', (data) => this.emit('state', data));
    this.socket.on('hazard-added', (data) => this.emit('hazard-added', data));
    this.socket.on('hazard-removed', (data) => this.emit('hazard-removed', data));
    this.socket.on('hazard-updated', (data) => this.emit('hazard-updated', data));
    this.socket.on('route-result', (data) => this.emit('route-result', data));
    this.socket.on('route-error', (data) => this.emit('route-error', data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => callback(data));
    }
  }

  requestRoute(start, end, algorithm = 'astar') {
    if (this.socket) {
      this.socket.emit('request-route', { start, end, algorithm });
    }
  }

  ping() {
    if (this.socket) {
      this.socket.emit('ping');
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new WebSocketClient();
