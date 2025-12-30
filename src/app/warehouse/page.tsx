'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Types
interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
}

interface WarehouseStats {
  totalCapacity: number
  availableCapacity: number
  occupancyPercent: number
  todayInbound: number
  todayOutbound: number
  pendingInbound: number
  pendingOutbound: number
  totalRevenue: number
  monthlyRevenue: number
  avgTurnaroundHours: number
  damageReports: number
}

interface InventoryItem {
  id: string
  shipmentId: string
  unitId: string
  unitNumber: number
  description: string
  pallets: number
  weight: number
  storageDays: number
  status: string
  arrivedAt: string
  location: string
}

interface UpcomingSlot {
  id: string
  type: 'INBOUND' | 'OUTBOUND'
  date: string
  time: string
  shipmentRef: string
  carrier: string
  units: number
}

export default function WarehouseDashboard() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState<WarehouseStats>({
    totalCapacity: 5000,
    availableCapacity: 2800,
    occupancyPercent: 44,
    todayInbound: 12,
    todayOutbound: 8,
    pendingInbound: 5,
    pendingOutbound: 3,
    totalRevenue: 45600,
    monthlyRevenue: 8200,
    avgTurnaroundHours: 18,
    damageReports: 2
  })

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      shipmentId: 'VN-2025-001',
      unitId: 'u1',
      unitNumber: 1,
      description: 'Electronics - Milano',
      pallets: 4,
      weight: 1200,
      storageDays: 3,
      status: 'STORED',
      arrivedAt: '2025-12-24T10:30:00Z',
      location: 'A-3-2'
    },
    {
      id: '2',
      shipmentId: 'VN-2025-002',
      unitId: 'u2',
      unitNumber: 1,
      description: 'Furniture - Munich',
      pallets: 8,
      weight: 2400,
      storageDays: 1,
      status: 'AWAITING_PICKUP',
      arrivedAt: '2025-12-26T14:00:00Z',
      location: 'B-1-1'
    },
    {
      id: '3',
      shipmentId: 'VN-2025-003',
      unitId: 'u3',
      unitNumber: 1,
      description: 'Food Products (Reefer)',
      pallets: 6,
      weight: 1800,
      storageDays: 2,
      status: 'STORED',
      arrivedAt: '2025-12-25T08:00:00Z',
      location: 'C-2-1'
    }
  ])

  const [upcomingSlots, setUpcomingSlots] = useState<UpcomingSlot[]>([
    {
      id: '1',
      type: 'INBOUND',
      date: '2025-12-27',
      time: '09:00',
      shipmentRef: 'VN-2025-004',
      carrier: 'TransEuropa SRL',
      units: 6
    },
    {
      id: '2',
      type: 'OUTBOUND',
      date: '2025-12-27',
      time: '11:00',
      shipmentRef: 'VN-2025-002',
      carrier: 'FastFreight GmbH',
      units: 8
    },
    {
      id: '3',
      type: 'INBOUND',
      date: '2025-12-27',
      time: '14:00',
      shipmentRef: 'VN-2025-005',
      carrier: 'Alpine Logistics',
      units: 4
    }
  ])

  useEffect(() => {
    setMounted(true)

    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!userStr || !token) {
      router.push('/login')
      return
    }

    try {
      const userData = JSON.parse(userStr)
      setUser(userData)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">Warehouse Hub</span>
              </Link>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">ACTIVE</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-white relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user?.firstName} - Operational Overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Capacity */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Capacity</span>
              <div className={`w-3 h-3 rounded-full ${stats.occupancyPercent > 80 ? 'bg-red-500' : stats.occupancyPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            </div>
            <div className="text-2xl font-bold text-white">{stats.occupancyPercent}%</div>
            <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${stats.occupancyPercent > 80 ? 'bg-red-500' : stats.occupancyPercent > 60 ? 'bg-yellow-500' : 'bg-cyan-500'}`}
                style={{ width: `${stats.occupancyPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-1">{stats.availableCapacity.toLocaleString()} m³ available</p>
          </div>

          {/* Today's Activity */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <span className="text-slate-400 text-sm">Today&apos;s Activity</span>
            <div className="mt-2 flex items-center gap-4">
              <div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-xl font-bold text-white">{stats.todayInbound}</span>
                </div>
                <p className="text-xs text-slate-500">Inbound</p>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-xl font-bold text-white">{stats.todayOutbound}</span>
                </div>
                <p className="text-xs text-slate-500">Outbound</p>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <span className="text-slate-400 text-sm">Pending</span>
            <div className="text-2xl font-bold text-white mt-2">
              {stats.pendingInbound + stats.pendingOutbound}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">{stats.pendingInbound} in</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-500">{stats.pendingOutbound} out</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <span className="text-slate-400 text-sm">Monthly Revenue</span>
            <div className="text-2xl font-bold text-white mt-2">€{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-400 mt-1">+12% vs last month</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Inventory */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Current Inventory</h2>
              <span className="text-sm text-cyan-400 hover:text-cyan-300 cursor-pointer">
                View All
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-700">
                    <th className="px-4 py-3 font-medium">Shipment</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Pallets</th>
                    <th className="px-4 py-3 font-medium">Days</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{item.shipmentId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-300 text-sm">{item.description}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded font-mono">
                          {item.location}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{item.pallets}</td>
                      <td className="px-4 py-3">
                        <span className={`${item.storageDays > 2 ? 'text-yellow-400' : 'text-slate-300'}`}>
                          {item.storageDays}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          item.status === 'AWAITING_PICKUP' ? 'bg-blue-500/20 text-blue-400' :
                          item.status === 'STORED' ? 'bg-green-500/20 text-green-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-cyan-400 hover:text-cyan-300" title="Scan">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                          </button>
                          <button className="p-1 text-slate-400 hover:text-white" title="Details">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Slots */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Upcoming Slots</h2>
              <span className="text-sm text-cyan-400 hover:text-cyan-300 cursor-pointer">
                Calendar
              </span>
            </div>
            <div className="p-4 space-y-3">
              {upcomingSlots.map((slot) => (
                <div key={slot.id} className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${slot.type === 'INBOUND' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                      <span className="text-white font-medium text-sm">{slot.shipmentRef}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      slot.type === 'INBOUND' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {slot.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{slot.date} at {slot.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span>{slot.carrier}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>{slot.units} units</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 hover:bg-cyan-500/20 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-white font-medium">QR Scan</h3>
            <p className="text-slate-400 text-xs mt-1">Scan IN/OUT</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-white font-medium">Inventory</h3>
            <p className="text-slate-400 text-xs mt-1">View all items</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-white font-medium">Slot Calendar</h3>
            <p className="text-slate-400 text-xs mt-1">Manage availability</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-white font-medium">Reports</h3>
            <p className="text-slate-400 text-xs mt-1">Analytics & earnings</p>
          </div>
        </div>

        {/* Alerts */}
        {stats.damageReports > 0 && (
          <div className="mt-6 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-orange-400 font-medium">{stats.damageReports} items approaching storage limit</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Some items are nearing the standard 3-day storage period. Consider notifying carriers.
                </p>
              </div>
              <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                View
              </button>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Avg Turnaround</span>
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white mt-2">{stats.avgTurnaroundHours}h</div>
            <p className="text-xs text-green-400 mt-1">-2h from last week</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Total Capacity</span>
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white mt-2">{stats.totalCapacity.toLocaleString()} m³</div>
            <p className="text-xs text-slate-500 mt-1">{stats.availableCapacity.toLocaleString()} m³ free</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Total Revenue</span>
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white mt-2">€{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </div>
        </div>
      </main>
    </div>
  )
}
