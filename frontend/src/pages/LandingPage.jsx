import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoomKey } from '../utils/crypto';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '../context/SocketContext'; // Adjust path if needed

const LandingPage = () => {
  const [password, setPassword] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const navigate = useNavigate();

  const { socket } = useSocket();
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!password) return alert("Please set a room password.");

    const roomId = uuidv4().slice(0, 8);
    const cryptoKey = await generateRoomKey();

    // Register room with backend
    socket.emit('create-room', { roomId, passwordHash: password });

    navigate(`/chat/${roomId}#${cryptoKey}`, { state: { isOwner: true } });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinInput) return;

    // Logic: If they paste a full URL, extract the path and hash
    try {
      if (joinInput.includes('/chat/')) {
        const url = new URL(joinInput);
        navigate(url.pathname + url.hash);
      } else {
        // Fallback for just ID
        navigate(`/chat/${joinInput}`);
      }
    } catch (err) {
      alert("Invalid link or ID");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 backdrop-blur-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">GhostQnA</h1>
          <p className="text-zinc-400 mt-2">Ephemeral, encrypted, and gone forever.</p>
        </div>

        <div className="space-y-6">
          {/* Create Section */}
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Create a Room</h2>
            <input
              type="password"
              placeholder="Set Room Password"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors">
              Start New Session
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-zinc-600 text-sm">OR</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          {/* Join Section */}
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Join a Room</h2>
            <input
              type="text"
              placeholder="Paste Invite Link or Room ID"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value)}
            />
            <button className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-medium py-2 rounded-lg transition-colors">
              Join Session
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs text-zinc-600 mt-8">
          No logs. No tracking. No history.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
