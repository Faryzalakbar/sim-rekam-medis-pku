import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'

export type NextApiResponseServerIO = {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

let io: ServerIO

export const initSocket = (server: NetServer) => {
  if (!io) {
    io = new ServerIO(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join-room', (room) => {
        socket.join(room)
        console.log(`Client ${socket.id} joined room: ${room}`)
      })

      socket.on('leave-room', (room) => {
        socket.leave(room)
        console.log(`Client ${socket.id} left room: ${room}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  return io
}

export const getSocket = () => io

export const emitNotification = (room: string, event: string, data: any) => {
  if (io) {
    io.to(room).emit(event, data)
  }
}
