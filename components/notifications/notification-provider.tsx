"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useToast } from '@/hooks/use-toast'

interface NotificationContextType {
  socket: Socket | null
  isConnected: boolean
}

const NotificationContext = createContext<NotificationContextType>({
  socket: null,
  isConnected: false
})

export function useNotifications() {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
      path: '/api/socket'
    })

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server')
      setIsConnected(false)
    })

    // Listen for notifications
    socketInstance.on('new-record', (data) => {
      toast({
        title: "Rekam Medis Baru",
        description: `Rekam medis baru untuk ${data.pasien} (${data.noRekamMedis})`
      })
    })

    socketInstance.on('new-visit', (data) => {
      toast({
        title: "Kunjungan Baru",
        description: `Kunjungan baru dari ${data.pasien} ke ${data.klinik}`
      })
    })

    socketInstance.on('prescription-ready', (data) => {
      toast({
        title: "Resep Siap",
        description: `Resep untuk ${data.pasien} sudah siap diambil`
      })
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [toast])

  return (
    <NotificationContext.Provider value={{ socket, isConnected }}>
      {children}
    </NotificationContext.Provider>
  )
}
