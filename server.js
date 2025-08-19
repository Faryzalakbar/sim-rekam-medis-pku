const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Inisialisasi aplikasi Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Buat server HTTP kustom
  const httpServer = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Pasang Socket.IO ke server HTTP
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Sesuaikan di produksi nanti
      methods: ["GET", "POST"]
    }
  });

  // Logika Socket.IO Anda
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`Client ${socket.id} joined room: ${room}`);
    });

    socket.on('leave-room', (room) => {
      socket.leave(room);
      console.log(`Client ${socket.id} left room: ${room}`);
    });

    // Event untuk mengirim notifikasi
    socket.on('send-notification', (data) => {
        // Mengirim ke semua klien kecuali pengirim
        socket.broadcast.emit('receive-notification', data);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  // Jalankan server
  httpServer
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    })
    .on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
});
