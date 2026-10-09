const { io } = require('../../frontend/node_modules/socket.io-client');

const SOCKET_URL = 'http://localhost:5000';

async function testSocket() {
  console.log('\n--- Testing WebRTC Signaling & Socket.io ---');
  return new Promise((resolve, reject) => {
    const socket1 = io(SOCKET_URL, { reconnection: false });
    const socket2 = io(SOCKET_URL, { reconnection: false });

    let connectedCount = 0;
    const roomId = 'room_e2e_test_' + Date.now();

    function checkReady() {
      connectedCount++;
      if (connectedCount === 2) {
        console.log('✅ Both sockets connected to server');
        socket1.emit('join-room', roomId, 'patient_user');
        setTimeout(() => {
          socket2.emit('join-room', roomId, 'doctor_user');
        }, 150);
      }
    }

    socket1.on('connect', checkReady);
    socket2.on('connect', checkReady);

    socket1.on('user-connected', (userId) => {
      console.log(`✅ Socket 1 notified: User connected (${userId})`);
      // Patient sends WebRTC offer
      socket1.emit('offer', { target: roomId, sdp: 'fake_sdp_offer', sender: 'patient_user' });
    });

    socket2.on('offer', (payload) => {
      console.log('✅ Socket 2 received WebRTC offer');
      // Doctor sends WebRTC answer
      socket2.emit('answer', { target: roomId, sdp: 'fake_sdp_answer', sender: 'doctor_user' });
    });

    socket1.on('answer', (payload) => {
      console.log('✅ Socket 1 received WebRTC answer');
      // Send ICE Candidate
      socket1.emit('ice-candidate', { target: roomId, candidate: 'fake_candidate', sender: 'patient_user' });
    });

    socket2.on('ice-candidate', (payload) => {
      console.log('✅ Socket 2 received WebRTC ICE candidate');
      // End call
      socket1.emit('end-call', roomId);
    });

    socket2.on('call-ended', () => {
      console.log('✅ Socket 2 received call-ended notification');
      socket1.disconnect();
      socket2.disconnect();
      console.log('🎉 WebRTC Signaling P2P handshake verified PASS!\n');
      resolve();
    });

    setTimeout(() => {
      socket1.disconnect();
      socket2.disconnect();
      reject(new Error('Socket test timed out'));
    }, 8000);
  });
}

testSocket()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Socket test failed:', err.message);
    process.exit(1);
  });
