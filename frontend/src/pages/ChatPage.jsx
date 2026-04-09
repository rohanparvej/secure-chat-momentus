// import React, { useEffect, useState, useRef } from 'react';
// import { useParams, useLocation, useNavigate } from 'react-router-dom';
// import { useSocket } from '../context/SocketContext';
// import { decryptMessage, encryptMessage } from '../utils/crypto';

// const ChatPage = () => {
//   const { roomId } = useParams();
//   const { hash } = useLocation();
//   const navigate = useNavigate();
//   const { socket, userId } = useSocket();

//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isAuthorized, setIsAuthorized] = useState(false);
//   const [password, setPassword] = useState('');
//   const [username, setUsername] = useState(''); // NEW: Username state
//   const messagesEndRef = useRef(null); // NEW: For auto-scroll

//   // The encryption key is pulled from the URL hash (#)
//   const cryptoKey = hash.replace('#', '');

//   const location = useLocation();

//   useEffect(() => {
//     // If the owner just created the room, the password is in location.state
//     if (location.state?.password && !isAuthorized) {
//       const ownerPass = location.state.password;
//       const ownerName = "Host"; // Default name for the creator
      
//       setPassword(ownerPass);
//       setUsername(ownerName);

//       // Auto-join for the owner
//       socket.emit('join-room', { roomId, password: ownerPass, userId, username: ownerName }, (res) => {
//         if (res.success) setIsAuthorized(true);
//       });
//     }
//   }, [location.state, socket, isAuthorized, roomId, userId]);
//   // NEW: Auto-scroll to bottom whenever messages update
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     if (!socket) return;

//     // Listen for room termination
//     socket.on('room-terminated', () => {
//       alert("The owner has left. This room and all its data have been deleted.");
//       navigate('/');
//     });

//     // Listen for new messages
//     socket.on('receive-message', async (data) => {
//       try {
//         const decrypted = await decryptMessage(data.content, data.iv, cryptoKey);
//         setMessages((prev) => [...prev, { ...data, content: decrypted }]);
//       } catch (err) {
//         console.error("Failed to decrypt message. Key might be wrong.", err);
//       }
//     });

//     return () => {
//       socket.off('room-terminated');
//       socket.off('receive-message');
//     };
//   }, [socket, cryptoKey, navigate]);

//   const handleJoin = (e) => {
//     e.preventDefault();
//     if (!username.trim()) return alert("Please enter a username");
    
//     socket.emit('join-room', { roomId, password, userId, username }, (res) => {
//       if (res.success) setIsAuthorized(true);
//       else alert(res.message);
//     });
//   };

//   const copyInviteLink = () => {
//     navigator.clipboard.writeText(window.location.href);
//     alert("Invite link copied to clipboard!");
//   };

//   const sendMessage = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     // 1. Encrypt locally
//     const { content, iv } = await encryptMessage(input, cryptoKey);

//     // 2. Send encrypted gibberish to server
//     socket.emit('send-message', {
//       roomId,
//       content,
//       iv,
//       sender: userId, // Or a display name
//     });

//     setInput('');
//   };

//   if (!isAuthorized) {
//     return (
//       <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
//         <form onSubmit={handleJoin} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-sm space-y-4">
//           <h2 className="text-xl font-bold">Secure Access</h2>
//           <input 
//             type="text" 
//             placeholder="Choose a Username"
//             className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             required
//           />
//           <input 
//             type="password" 
//             placeholder="Room Password"
//             className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <button className="w-full bg-blue-600 py-2 rounded-lg font-bold">Enter Chat</button>
//         </form>
//       </div>
//     );
//   }


//   return (
//     <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
//       {/* Updated Header with Copy Button */}
//       <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
//         <div className="flex flex-col">
//           <h2 className="font-mono text-xs text-zinc-500 uppercase">Room ID: {roomId}</h2>
//           <button onClick={copyInviteLink} className="text-[10px] text-blue-400 hover:underline text-left">
//             Click to Copy Invite Link
//           </button>
//         </div>
//         <button onClick={() => navigate('/')} className="text-xs bg-red-900/20 text-red-400 px-3 py-1 rounded-full">Leave</button>
//       </div>

//       {/* Messages Area */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-6">
//         {messages.map((msg, i) => (
//           <div key={i} className={`flex flex-col ${msg.sender === userId ? 'items-end' : 'items-start'}`}>
//             <span className="text-[10px] text-zinc-500 mb-1 px-1 flex items-center gap-1">
//               {msg.senderName} {msg.isOwner && <span className="text-yellow-500 text-[8px] bg-yellow-500/10 px-1 rounded border border-yellow-500/20">HOST</span>}
//             </span>
//             <div className={`max-w-[85%] p-3 rounded-2xl ${msg.sender === userId ? 'bg-blue-600 rounded-tr-none' : 'bg-zinc-800 rounded-tl-none'}`}>
//               <p className="text-sm leading-relaxed">{msg.content}</p>
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} /> {/* Scroll Anchor */}
//       </div>

//       {/* Input Area with AutoFocus */}
//       <form onSubmit={sendMessage} className="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-2">
//         <input 
//           autoFocus
//           type="text"
//           placeholder="Message securely..."
//           className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//         />
//         <button className="bg-white text-black px-6 rounded-xl font-bold">Send</button>
//       </form>
//     </div>
//   );
// };

// export default ChatPage;



import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { decryptMessage, encryptMessage } from '../utils/crypto';

const ChatPage = () => {
  const { roomId } = useParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const { socket, userId } = useSocket();
  const location = useLocation();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const messagesEndRef = useRef(null);

  // Determine if this user is the one who created the room
  const isOwner = location.state?.isOwner || false;
  const cryptoKey = hash.replace('#', '');

  // 1. AUTO-JOIN FOR OWNER
  useEffect(() => {
    if (location.state?.password && !isAuthorized) {
      const ownerPass = location.state.password;
      const ownerName = "Host";
      
      setPassword(ownerPass);
      setUsername(ownerName);

      // CRITICAL: We pass isOwner: true so the server knows this socket is the "Kill Switch"
      socket.emit('join-room', { roomId, password: ownerPass, userId, username: ownerName, isOwner: true }, (res) => {
        if (res.success) setIsAuthorized(true);
      });
    }
  }, [location.state, socket, isAuthorized, roomId, userId]);

  // 2. LISTEN FOR ROOM TERMINATION (The "Nuke" signal)
  useEffect(() => {
    if (!socket) return;

    socket.on('room-terminated', () => {
      alert("Host has disconnected. All messages and room data have been permanently wiped.");
      navigate('/');
    });

    socket.on('receive-message', async (data) => {
      try {
        const decrypted = await decryptMessage(data.content, data.iv, cryptoKey);
        setMessages((prev) => [...prev, { ...data, content: decrypted }]);
      } catch (err) {
        console.error("Decryption failed", err);
      }
    });

    return () => {
      socket.off('room-terminated');
      socket.off('receive-message');
    };
  }, [socket, cryptoKey, navigate]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim()) return alert("Please enter a username");
    
    // Guest join (isOwner is false by default)
    socket.emit('join-room', { roomId, password, userId, username, isOwner: false }, (res) => {
      if (res.success) setIsAuthorized(true);
      else alert(res.message);
    });
  };

  const handleLeave = () => {
    if (isOwner) {
      // If the owner leaves, we tell the server to nuke it immediately 
      // instead of waiting for a socket timeout/disconnect
      socket.emit('delete-room', { roomId });
    }
    navigate('/');
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Invite link copied!");
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const { content, iv } = await encryptMessage(input, cryptoKey);
    socket.emit('send-message', { roomId, content, iv, sender: userId });
    setInput('');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-blue-500/5 blur-[120px] pointer-events-none"></div>
        <form onSubmit={handleJoin} className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800 w-full max-w-sm space-y-6 shadow-2xl relative">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Secure Access</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Room: {roomId}</p>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Alias"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Room Passkey"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-600/20">
            Decrypt & Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* MODERN HEADER */}
      <header className="p-4 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <div className="flex flex-col">
            <h2 className="font-mono text-[10px] text-zinc-500 font-black tracking-widest uppercase">Node_{roomId}</h2>
            <button onClick={copyInviteLink} className="text-[10px] text-blue-400/80 hover:text-blue-400 flex items-center gap-1 transition-colors">
              <span>copy_invite_link</span>
            </button>
          </div>
        </div>
        <button 
          onClick={handleLeave} 
          className="text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-full hover:bg-red-500/20 transition-all active:scale-95"
        >
          Disconnect
        </button>
      </header>

      {/* MESSAGES */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.sender === userId ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-2 mb-1 px-1 ${msg.sender === userId ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">{msg.senderName}</span>
              {msg.isOwner && <span className="text-[8px] bg-white text-black px-1 rounded font-black leading-tight uppercase">Root</span>}
            </div>
            <div className={`max-w-[80%] md:max-w-[60%] p-4 rounded-2xl shadow-xl transition-all ${
              msg.sender === userId 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* INPUT */}
      <footer className="p-6 bg-zinc-950">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-2 rounded-2xl focus-within:border-blue-500/50 transition-all shadow-2xl">
          <input 
            autoFocus
            type="text"
            placeholder="Type an encrypted message..."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm placeholder:text-zinc-700"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="bg-white text-black h-10 px-6 rounded-xl font-bold text-xs hover:bg-zinc-200 transition-all active:scale-95">
            Send
          </button>
        </form>
      </footer >
    </div>
  );
};

export default ChatPage;