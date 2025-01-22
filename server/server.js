const io = require("socket.io")(process.env.PORT || 3001, {
    cors: {
      // origin: "http://localhost:3000",
      origin: "https://love-tunes-brown.vercel.app",
    },
  });
  
  let roomVideoState = {};  // Store the current video state per room
  let roomMessages = {};  // Store the messages per room
  
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    // Handle user joining a room
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      io.to(roomId).emit("room-users", getUsersInRoom(roomId));
  
      // Send current video state to the new user
      if (roomVideoState[roomId]) {
        const { videoId, isPlaying } = roomVideoState[roomId];
        socket.emit("play-video", videoId);
        socket.emit("video-state", isPlaying);
      }
  
      // Send previous messages to the new user
      if (roomMessages[roomId]) {
        socket.emit("receive-message", roomMessages[roomId]);
      }
    });
  
    // Handle video play event
    socket.on("play-video", (roomId, videoId, videoTitle) => {
      if (!videoId) {
        console.error("Received undefined videoId in play-video event");
        return;
      }
  
      console.log("play-video:", videoId, videoTitle);
  
      roomVideoState[roomId] = { videoId, isPlaying: true };
      io.to(roomId).emit("play-video", videoId, videoTitle);
      io.to(roomId).emit("video-state", true);
    });
  
    // Handle video pause event
    socket.on("pause-video", (roomId) => {
      if (!roomVideoState[roomId]) {
        console.error(`Room ${roomId} video state not found`);
        return;
      }
  
      roomVideoState[roomId].isPlaying = false;
      io.to(roomId).emit("pause-video");
      io.to(roomId).emit("video-state", false);
    });
  
    // Handle message sending
    socket.on("send-message", (data) => {
      const { roomId, message, senderId, type, content } = data;
  
      console.log("Received message:", data);
  
      if (!roomMessages[roomId]) {
        roomMessages[roomId] = [];
      }
  
      // Store the message with type
      roomMessages[roomId].push({ type, message, senderId, content });
  
      // Broadcast the message to everyone in the room
      io.to(roomId).emit("receive-message", { type, message, senderId, content });
    });
  
    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
  
  // Helper function to get users in a room
  function getUsersInRoom(roomId) {
    const clients = io.sockets.adapter.rooms.get(roomId);
    return clients ? Array.from(clients) : [];
  }
  