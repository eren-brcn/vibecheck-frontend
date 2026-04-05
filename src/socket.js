import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

let socket = null;

const getAuthToken = () => localStorage.getItem('authToken') || null;

export const initSocket = () => {
  if (socket) return socket;

  socket = io(BACKEND_URL, {
    auth: (cb) => cb({ token: getAuthToken() }),
    extraHeaders: {
      Authorization: `Bearer ${getAuthToken() || ''}`
    },
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const joinNotifications = () => {
  if (!socket) {
    return;
  }

  const emitJoin = () => socket.emit('join-notifications');
  if (socket.connected) {
    emitJoin();
    return;
  }

  socket.once('connect', emitJoin);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initSocket,
  getSocket,
  joinNotifications,
  disconnectSocket,
};
