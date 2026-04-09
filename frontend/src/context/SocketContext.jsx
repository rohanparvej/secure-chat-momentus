import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [userId] = useState(() => {
    // Check if UUID exists, otherwise create a new one
    const savedId = localStorage.getItem('ephemeral_uuid');
    if (savedId) return savedId;
    const newId = uuidv4();
    localStorage.setItem('ephemeral_uuid', newId);
    return newId;
  });

useEffect(() => {
  // 1. Get the URL from Vite environment variables, or fallback to localhost
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // 2. Connect using the dynamic URL
  const newSocket = io(backendUrl, {
    query: { userId }
  });

  setSocket(newSocket);

  // Cleanup on unmount
  return () => newSocket.close();
}, [userId]);

  return (
    <SocketContext.Provider value={{ socket, userId }}>
      {children}
    </SocketContext.Provider>
  );
};
