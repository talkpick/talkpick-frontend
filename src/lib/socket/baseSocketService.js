'use client';

import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { SOCKET_CONFIG, SOCKET_EVENTS } from './constants';

class BaseSocketService {
  constructor() {
    this.stompClient = null;
    this.subscriptions = new Map();
    this.connectionStatus = false;
    this.connectionPromise = null;
    this.reconnectTimeout = null;
  }

  createStompClient() {
    const socket = new SockJS(SOCKET_CONFIG.ENDPOINT);
    return Stomp.over(socket);
  }

  async connect(headers = {}) {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.stompClient?.connected) {
      return Promise.resolve();
    }

    this.stompClient = this.createStompClient();
    
    this.connectionPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, SOCKET_CONFIG.CONNECT_TIMEOUT);

      this.stompClient.connect(
        headers,
        () => {
          clearTimeout(timeout);
          this.connectionStatus = true;
          this.connectionPromise = null;
          this.setupHeartbeat();
          resolve();
        },
        (error) => {
          clearTimeout(timeout);
          this.connectionStatus = false;
          this.connectionPromise = null;
          console.error('[BaseSocketService] Connection error:', error);
          this.handleConnectionError(error);
          reject(error);
        }
      );
    });

    return this.connectionPromise;
  }

  setupHeartbeat() {
    // STOMP 클라이언트의 heartbeat 설정
    if (this.stompClient) {
      this.stompClient.heartbeat.outgoing = 20000; // 20초
      this.stompClient.heartbeat.incoming = 20000;
    }
  }

  subscribe(topic, callback) {
    if (!this.stompClient?.connected) {
      throw new Error('Socket is not connected');
    }

    if (this.subscriptions.has(topic)) {
      return this.subscriptions.get(topic);
    }

    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        callback(parsedMessage);
      } catch (error) {
        console.error('[BaseSocketService] Message parsing error:', error);
      }
    });

    this.subscriptions.set(topic, subscription);
    return subscription;
  }

  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  disconnect() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();

    if (this.stompClient?.connected) {
      this.stompClient.disconnect(() => {
        this.connectionStatus = false;
        console.log('[BaseSocketService] Disconnected');
      });
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stompClient = null;
  }

  handleConnectionError(error) {
    this.connectionStatus = false;
    
    // 재연결 시도
    if (!this.reconnectTimeout) {
      this.reconnectTimeout = setTimeout(() => {
        console.log('[BaseSocketService] Attempting to reconnect...');
        this.connect()
          .catch(() => {
            // 재연결 실패 시 다시 시도
            this.handleConnectionError(error);
          });
      }, SOCKET_CONFIG.RECONNECT_DELAY);
    }
  }

  isConnected() {
    return this.connectionStatus && this.stompClient?.connected;
  }

  send(destination, headers = {}, body = {}) {
    if (!this.isConnected()) {
      throw new Error('Socket is not connected');
    }

    this.stompClient.send(destination, headers, JSON.stringify(body));
  }
}

export default BaseSocketService; 