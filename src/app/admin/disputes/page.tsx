'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// Types
interface Dispute {
  id: string
  shipmentId: string
  unitId: string
  type: string
  status: string
  damageDescription: string
  estimatedValue: number | null
  suggestedLiability: string | null
  suggestedLiabilityScore: number | null
  finalLiability: string | null
  compensationAmount: number | null
  createdAt: string
  resolvedAt: string | null
  createdByName: string | null
  createdByRole: string
  isAutoCreated: boolean
}

interface Stats {
  total: number
  open: number
  underReview: number
  evidenceComplete: number
  resolved: number
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  OPEN: { label: 'E Hapur', color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
  UNDER_REVIEW: { label: 'Në Shqyrtim', color: 'text-blue-400', bgColor: 'bg-blue-500' },
  EVIDENCE_COMPLETE: { label: 'Provat Gati', color: 'text-purple-400', bgColor: 'bg-purple-500' },
  RESOLVED: { label: 'E Zgjidhur', color: 'text-green-400', bgColor: 'bg-green-500' }
}

const TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  DAMAGE_AT_PICKUP: { label: 'Dëmtim në Marrje', icon: '📦' },
  DAMAGE_AT_WAREHOUSE: { label: 'Dëmtim në Magazinë', icon: '🏭' },
  DAMAGE_AT_DELIVERY: { label: 'Dëmtim në Dorëzim', icon: '🚛' },
  DAMAGE_IN_TRANSIT: { label: 'Dëmtim në Transport', icon: '🛣️' },
  CLIENT_REPORT: { label: 'Raport Klienti', icon: '📝' }
}

const LIABILITY_CONFIG: Record<string, { label: string; color: string }> = {
  CARRIER: { label: 'Transportues', color: 'text-orange-400' },
  WAREHOUSE: { label: 'Magazinë', color: 'text-purple-400' },
  CLIENT: { label: 'Klient', color: 'text-blue-400' },
  SHIPPER: { label: 'Dërgues', color: 'text-cyan-400' },
  UNKNOWN: { label: 'E Papërcaktuar', color: 'text-slate-400' }
}

export default function AdminDisputesPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  // State
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Stats
  const [stats, setStats] = useState<Stats>({
    total: 0,
    open: 0,
    underReview: 0,
    evidenceComplete: 0,
    resolved: 0
  })

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          setUserRole(user.role)
        } catch {
          // Invalid
        }
      }
    } else {
      setLoading(false)
    }
  }, [])

  // Fetch disputes
  const fetchDisputes = useCallback(async () => {
    if (!isAuthenticated || userRole !== 'ADMIN') return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter })
      })

      const res = await fetch(`${API_URL}/api/disputes/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error('Failed to fetch disputes')
      }

      const data = await res.json()
      setDisputes(data.disputes || [])
      setTotalPages(data.pagination?.pages || 1)

      // Calculate stats
      const allDisputes = data.disputes || []
      setStats({
        total: data.pagination?.total || allDisputes.length,
        open: allDisputes.filter((d: Dispute) => d.status === 'OPEN').length,
        underReview: allDisputes.filter((d: Dispute) => d.status === 'UNDER_REVIEW').length,
        evidenceComplete: allDisputes.filter((d: Dispute) => d.status === 'EVIDENCE_COMPLETE').length,
        resolved: allDisputes.filter((d: Dispute) => d.status === 'RESOLVED').length
      })
    } catch {
      setError('Gabim gjatë marrjes së disputes')
    } finally {
      setLoading(false)
    }
  }, [API_URL, isAuthenticated, userRole, page, statusFilter, typeFilter])

  useEffect(() => {
    if (isAuthenticated && userRole === 'ADMIN') {
      fetchDisputes()
    }
  }, [isAuthenticated, userRole, fetchDisputes])

  // Not admin
  if (!loading && (!isAuthenticated || userRole !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm w-full border border-slate-700">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Akses i Kufizuar</h1>
          <p className="text-slate-400 mb-6">Vetëm administratorët kanë akses në këtë faqe.</p>
          <Link href="/" className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">
            Kthehu në Ballina
          </Link>
        </div>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Duke ngarkuar panelin e admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-white">
              Vector<span className="text-cyan-400">Node</span>
            </Link>
            <span className="text-slate-500">/</span>
            <h1 className="text-lg font-semibold text-white">👑 Admin - Dispute Panel</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Totali</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div
            className="bg-slate-800 rounded-xl border border-yellow-500/30 p-4 cursor-pointer hover:bg-yellow-500/5 transition-colors"
            onClick={() => { setStatusFilter('OPEN'); setPage(1); }}
          >
            <p className="text-yellow-400 text-sm">E Hapur</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.open}</p>
          </div>
          <div
            className="bg-slate-800 rounded-xl border border-blue-500/30 p-4 cursor-pointer hover:bg-blue-500/5 transition-colors"
            onClick={() => { setStatusFilter('UNDER_REVIEW'); setPage(1); }}
          >
            <p className="text-blue-400 text-sm">Në Shqyrtim</p>
            <p className="text-3xl font-bold text-blue-400">{stats.underReview}</p>
          </div>
          <div
            className="bg-slate-800 rounded-xl border border-purple-500/30 p-4 cursor-pointer hover:bg-purple-500/5 transition-colors"
            onClick={() => { setStatusFilter('EVIDENCE_COMPLETE'); setPage(1); }}
          >
            <p className="text-purple-400 text-sm">Provat Gati</p>
            <p className="text-3xl font-bold text-purple-400">{stats.evidenceComplete}</p>
          </div>
          <div
            className="bg-slate-800 rounded-xl border border-green-500/30 p-4 cursor-pointer hover:bg-green-500/5 transition-colors"
            onClick={() => { setStatusFilter('RESOLVED'); setPage(1); }}
          >
            <p className="text-green-400 text-sm">Zgjidhur</p>
            <p className="text-3xl font-bold text-green-400">{stats.resolved}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Statusi:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">Të gjitha</option>
              <option value="OPEN">E Hapur</option>
              <option value="UNDER_REVIEW">Në Shqyrtim</option>
              <option value="EVIDENCE_COMPLETE">Provat Gati</option>
              <option value="RESOLVED">E Zgjidhur</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Lloji:</span>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">Të gjitha</option>
              {Object.entries(TYPE_CONFIG).map(([key, conf]) => (
                <option key={key} value={key}>{conf.label}</option>
              ))}
            </select>
          </div>

          {(statusFilter || typeFilter) && (
            <button
              onClick={() => { setStatusFilter(''); setTypeFilter(''); setPage(1); }}
              className="text-sm text-cyan-400 hover:underline"
            >
              Pastro filtrat
            </button>
          )}

          <div className="ml-auto text-sm text-slate-400">
            {disputes.length} dispute(s)
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {/* Disputes Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Lloji</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Statusi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Përshkrimi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Përgjegjësia</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Vlera</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Krijuar</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {disputes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      Asnjë dispute me këto filtra
                    </td>
                  </tr>
                ) : (
                  disputes.map((dispute) => {
                    const statusConf = STATUS_CONFIG[dispute.status]
                    const typeConf = TYPE_CONFIG[dispute.type] || { label: dispute.type, icon: '📋' }
                    const liabilityConf = LIABILITY_CONFIG[dispute.suggestedLiability || 'UNKNOWN']

                    return (
                      <tr key={dispute.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span>{typeConf.icon}</span>
                            <div>
                              <p className="text-white text-sm font-medium">{typeConf.label}</p>
                              <p className="text-slate-500 text-xs">
                                {dispute.isAutoCreated ? 'Auto' : 'Manual'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-white text-xs font-medium ${statusConf.bgColor}`}>
                            {statusConf.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-300 text-sm line-clamp-2 max-w-xs">
                            {dispute.damageDescription}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {dispute.finalLiability ? (
                            <span className={`font-medium ${LIABILITY_CONFIG[dispute.finalLiability].color}`}>
                              ✓ {LIABILITY_CONFIG[dispute.finalLiability].label}
                            </span>
                          ) : (
                            <span className={`text-sm ${liabilityConf.color}`}>
                              {liabilityConf.label}
                              {dispute.suggestedLiabilityScore && (
                                <span className="text-slate-500 ml-1">({dispute.suggestedLiabilityScore}%)</span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {dispute.compensationAmount ? (
                            <span className="text-green-400 font-medium">€{dispute.compensationAmount.toFixed(2)}</span>
                          ) : dispute.estimatedValue ? (
                            <span className="text-slate-300">€{dispute.estimatedValue.toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-400 text-sm">
                            {new Date(dispute.createdAt).toLocaleDateString('sq-AL')}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {dispute.createdByName || dispute.createdByRole}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/disputes/${dispute.id}`}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg transition-colors"
                          >
                            Shiko
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              ← Para
            </button>
            <span className="px-4 py-2 text-slate-400">
              Faqja {page} nga {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              Pas →
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold mb-2">📊 Raporte</h3>
            <p className="text-slate-400 text-sm mb-4">Shiko statistika dhe raporte të detajuara mbi disputes.</p>
            <button className="text-cyan-400 hover:underline text-sm">Shiko Raportet →</button>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold mb-2">⚙️ Konfigurime</h3>
            <p className="text-slate-400 text-sm mb-4">Menaxho rregullat e dispute-ve dhe parametrat.</p>
            <button className="text-cyan-400 hover:underline text-sm">Hap Konfigurimet →</button>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold mb-2">📧 Njoftime</h3>
            <p className="text-slate-400 text-sm mb-4">Menaxho njoftimet automatike për disputes.</p>
            <button className="text-cyan-400 hover:underline text-sm">Konfiguro Njoftimet →</button>
          </div>
        </div>
      </main>
    </div>
  )
}
