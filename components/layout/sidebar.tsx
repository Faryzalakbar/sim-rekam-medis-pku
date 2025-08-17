"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Building2, Users, FileText, Activity, Pill, Calendar, Settings, ChevronLeft, ChevronRight, Home, UserCheck, Stethoscope, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Sidebar() {
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [])

  if (!user) return null

  const getMenuItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        icon: Home,
        href: `/dashboard/${user.role.toLowerCase()}`,
        color: 'text-blue-600'
      }
    ]

    switch (user.role) {
      case 'ADMIN':
        return [
          ...baseItems,
          {
            title: 'Manajemen Pasien',
            icon: Users,
            href: '/pasien',
            color: 'text-green-600'
          },
          {
            title: 'Kunjungan',
            icon: Activity,
            href: '/kunjungan',
            color: 'text-purple-600'
          },
          {
            title: 'Rekam Medis',
            icon: FileText,
            href: '/rekam-medis',
            color: 'text-orange-600'
          },
          {
            title: 'Manajemen Obat',
            icon: Pill,
            href: '/obat',
            color: 'text-red-600'
          },
          {
            title: 'Absensi',
            icon: UserCheck,
            href: '/absensi',
            color: 'text-indigo-600'
          },
          {
            title: 'Pengaturan',
            icon: Settings,
            href: '/settings',
            color: 'text-gray-600'
          }
        ]
      
      case 'DOKTER':
        return [
          ...baseItems,
          {
            title: 'Pasien',
            icon: Users,
            href: '/pasien',
            color: 'text-green-600'
          },
          {
            title: 'Kunjungan',
            icon: Activity,
            href: '/kunjungan',
            color: 'text-purple-600'
          },
          {
            title: 'Rekam Medis',
            icon: FileText,
            href: '/rekam-medis',
            color: 'text-orange-600'
          },
        
        ]
      
      case 'APOTIK':
        return [
          ...baseItems,
          {
            title: 'Manajemen Obat',
            icon: Pill,
            href: '/obat',
            color: 'text-red-600'
          },
        ]
      
      case 'PEGAWAI':
        return [
          ...baseItems,
          {
            title: 'Absensi Saya',
            icon: UserCheck,
            href: '/absensi/saya',
            color: 'text-indigo-600'
          }
        ]
      
      default:
        return baseItems
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">SIM Rekam Medis</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Klinik PKU Muhammadiyah</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link key={index} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-white" : item.color
                )} />
                {!collapsed && (
                  <span className="font-medium text-sm">{item.title}</span>
                )}
                {isActive && !collapsed && (
                  <Heart className="h-3 w-3 text-white ml-auto animate-pulse" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-900/30">
            <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
              <Heart className="h-3 w-3 text-green-500" />
              <span className="font-medium">Melayani dengan Sepenuh Hati</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
