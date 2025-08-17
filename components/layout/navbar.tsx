"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, LogOut, Settings, User, Moon, Sun, Heart } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useToast } from '@/hooks/use-toast'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState(3)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      
      toast({
        title: "Logout berhasil 👋",
        description: "Terima kasih telah menggunakan sistem kami",
      })
      
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'from-red-500 to-red-600'
      case 'DOKTER': return 'from-green-500 to-green-600'
      case 'APOTIK': return 'from-purple-500 to-purple-600' // Anda mungkin ingin mengubah ini menjadi APOTEKER
      case 'PEGAWAI': return 'from-blue-500 to-blue-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator'
      case 'DOKTER': return 'Dokter'
      case 'APOTIK': return 'Apoteker' // Anda mungkin ingin mengubah ini menjadi APOTEKER
      case 'PEGAWAI': return 'Pegawai'
      default: return role
    }
  }

  if (!user) return null

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Dashboard {getRoleLabel(user.role)}
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Heart className="h-3 w-3 text-red-400" />
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="hover:bg-gray-100"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
          <Bell className="h-4 w-4" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {notifications}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(user.role)} text-white font-semibold`}>
                  {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-semibold leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getRoleColor(user.role)}`}></div>
                  <span className="text-xs text-muted-foreground font-medium">{getRoleLabel(user.role)}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
