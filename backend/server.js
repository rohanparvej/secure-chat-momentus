// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const Message = require('./models/Message');
// const Room = require('./models/Room');

// const app = express();
// app.use(cors());
// app.use(express.json());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: process.env.FRONTEND_URL }
// });

// // In-memory tracking for quick lookups and owner tracking
// const activeRooms = new Map();

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   // 1. CREATE ROOM (Owner)
//   socket.on('create-room', async ({ roomId, passwordHash }) => {
//   try {
//     const newRoom = new Room({ roomId, passwordHash, ownerSocketId: socket.id });
//     await newRoom.save();

//     // Set a timer to kill the room in 10 minutes (600,000 ms)
//     const killTimer = setTimeout(async () => {
//       console.log(`Timer expired. Nuking room: ${roomId}`);
      
//       io.to(roomId).emit('room-terminated', { reason: "Time limit reached (10 mins)." });
      
//       await Message.deleteMany({ roomId });
//       await Room.deleteOne({ roomId });
//       activeRooms.delete(roomId);
//     }, 300000); //currently 1 min

//     // Store the timer ID in our Map
//     activeRooms.set(roomId, { 
//       ownerId: socket.id, 
//       passwordHash, 
//       timer: killTimer 
//     });

//     socket.join(roomId);
//   } catch (err) {
//     console.error(err);
//   }
// });

//   // 2. JOIN ROOM (The Gatekeeper)
//   socket.on('join-room', async ({ roomId, password, userId, username }, callback) => {
//   try {
//     let roomData = activeRooms.get(roomId);
//     if (!roomData) {
//       const roomInDb = await Room.findOne({ roomId });
//       if (roomInDb) {
//         roomData = { ownerId: roomInDb.ownerSocketId, passwordHash: roomInDb.passwordHash };
//         activeRooms.set(roomId, roomData);
//       }
//     }

//     if (roomData && roomData.passwordHash === password) {
//       socket.join(roomId);
//       // Store the username on the socket object for easy access
//       socket.username = username; 
//       callback({ success: true });
//     } else {
//       callback({ success: false, message: "Invalid Password" });
//     }
//   } catch (err) {
//     callback({ success: false, message: "Server Error" });
//   }
// });


//   // 3. SEND ENCRYPTED MESSAGE
//   socket.on('send-message', async (data) => {
//   const { roomId, content, iv, sender } = data;
//   const roomData = activeRooms.get(roomId);

//   const payload = {
//     ...data,
//     senderName: socket.username || "Anonymous",
//     isOwner: socket.id === roomData?.ownerId // True if sender is the host
//   };

//   try {
//     // Save to DB
//     const newMessage = new Message(payload);
//     await newMessage.save();

//     // Broadcast the enriched payload
//     io.to(roomId).emit('receive-message', payload);
//   } catch (err) {
//     console.error(err);
//   }
// });

//   // 4. THE KILL-SWITCH (Owner Disconnects)
//   socket.on('disconnect', async () => {
//   console.log('User disconnected:', socket.id);
  
//   for (const [roomId, data] of activeRooms.entries()) {
//     if (data.ownerId === socket.id) {
//       console.log(`Owner left. Nuking room: ${roomId}`);

//       // 1. CLEAR THE TIMER (prevents the 10-min function from running twice)
//       if (data.timer) clearTimeout(data.timer);

//       try {
//         io.to(roomId).emit('room-terminated');

//         await Message.deleteMany({ roomId });
//         await Room.deleteOne({ roomId });

//         activeRooms.delete(roomId);
//       } catch (err) {
//         console.error("Cleanup error:", err);
//       }
//     }
//   }
// });
// });
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`)))
//   .catch(err => console.log("DB Connection Error:", err));

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Message = require('./models/Message');
const Room = require('./models/Room');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL }
});

const activeRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 1. CREATE ROOM
  socket.on('create-room', async ({ roomId, passwordHash }) => {
    try {
      const newRoom = new Room({ roomId, passwordHash, ownerSocketId: socket.id });
      await newRoom.save();

      const killTimer = setTimeout(async () => {
        io.to(roomId).emit('room-terminated', { reason: "Time limit reached." });
        await Message.deleteMany({ roomId });
        await Room.deleteOne({ roomId });
        activeRooms.delete(roomId);
      }, 600000); // 10 mins

      activeRooms.set(roomId, { 
        ownerId: socket.id, 
        passwordHash, 
        timer: killTimer 
      });

      socket.isOwnerOf = roomId; 
      socket.join(roomId);
    } catch (err) {
      console.error(err);
    }
  });

  // 2. JOIN ROOM
  socket.on('join-room', async ({ roomId, password, username, isOwner }, callback) => {
    try {
      let roomData = activeRooms.get(roomId);
      
      if (!roomData) {
        const roomInDb = await Room.findOne({ roomId });
        if (roomInDb) {
          roomData = { ownerId: roomInDb.ownerSocketId, passwordHash: roomInDb.passwordHash };
          activeRooms.set(roomId, roomData);
        }
      }

      if (roomData && roomData.passwordHash === password) {
        if (isOwner) {
          roomData.ownerId = socket.id;
          socket.isOwnerOf = roomId; 
          await Room.updateOne({ roomId }, { ownerSocketId: socket.id });
        }

        socket.join(roomId);
        socket.username = username;
        callback({ success: true });
      } else {
        callback({ success: false, message: "Invalid Password" });
      }
    } catch (err) {
      callback({ success: false, message: "Server Error" });
    }
  });

  // 3. SEND MESSAGE
  socket.on('send-message', async (data) => {
    const { roomId, content, iv } = data;
    const roomData = activeRooms.get(roomId);

    const payload = {
      ...data,
      senderName: socket.username || "Anonymous",
      isOwner: socket.id === roomData?.ownerId 
    };

    try {
      const newMessage = new Message(payload);
      await newMessage.save();
      io.to(roomId).emit('receive-message', payload);
    } catch (err) {
      console.error(err);
    }
  });

  // 4. MANUAL DELETE (The "Nuke" Trigger)
  socket.on('delete-room', async ({ roomId }) => {
    const roomData = activeRooms.get(roomId);
    
    // Safety: Only the verified owner socket can trigger this
    if (roomData && roomData.ownerId === socket.id) {
      console.log(`Manual nuke triggered for room: ${roomId}`);
      
      try {
        io.to(roomId).emit('room-terminated');

        await Message.deleteMany({ roomId });
        await Room.deleteOne({ roomId });

        if (roomData.timer) clearTimeout(roomData.timer);
        activeRooms.delete(roomId);
      } catch (err) {
        console.error("Manual nuke error:", err);
      }
    }
  });

  // 5. THE KILL-SWITCH (Fallback for crashes/closes)
  socket.on('disconnect', async () => {
    const roomId = socket.isOwnerOf;
    
    if (roomId) {
      const data = activeRooms.get(roomId);
      if (data) {
        console.log(`Owner connection lost. Nuking room: ${roomId}`);

        if (data.timer) clearTimeout(data.timer);

        try {
          io.to(roomId).emit('room-terminated');
          await Message.deleteMany({ roomId });
          await Room.deleteOne({ roomId });
          activeRooms.delete(roomId);
        } catch (err) {
          console.error("Disconnect cleanup error:", err);
        }
      }
    }
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`)))
  .catch(err => console.log("DB Connection Error:", err));