/**
 * Video Socket
 * Handles WebRTC signaling for video consultations.
 */
const videoSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.id}`);

    // Join a specific consultation room
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      console.log(`[SOCKET] User ${userId} joined room ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit('user-connected', userId);
    });

    // WebRTC Signaling: Offer
    socket.on('offer', (payload) => {
      io.to(payload.target).emit('offer', {
        sdp: payload.sdp,
        sender: payload.sender
      });
    });

    // WebRTC Signaling: Answer
    socket.on('answer', (payload) => {
      io.to(payload.target).emit('answer', {
        sdp: payload.sdp,
        sender: payload.sender
      });
    });

    // WebRTC Signaling: ICE Candidate
    socket.on('ice-candidate', (payload) => {
      io.to(payload.target).emit('ice-candidate', {
        candidate: payload.candidate,
        sender: payload.sender
      });
    });

    // End call
    socket.on('end-call', (roomId) => {
      socket.to(roomId).emit('call-ended');
      console.log(`[SOCKET] Call ended in room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] User disconnected: ${socket.id}`);
    });
  });
};

module.exports = videoSocket;
