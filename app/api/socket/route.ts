import { NextRequest } from 'next/server'
import { NextApiResponseServerIO } from '@/lib/socket'

export async function GET(req: NextRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...')
    
    const io = new (require('socket.io').Server)(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    io.on('connection', (socket: any) => {
      console.log('Client connected:', socket.id)

      socket.on('join-room', (room: string) => {
        socket.join(room)
        console.log(`Client ${socket.id} joined room: ${room}`)
      })

      socket.on('leave-room', (room: string) => {
        socket.leave(room)
        console.log(`Client ${socket.id} left room: ${room}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    res.socket.server.io = io
  }

  return new Response('Socket.IO server initialized', { status: 200 })
}
