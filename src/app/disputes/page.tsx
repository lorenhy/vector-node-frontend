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
  liabilityReason: string | null
  finalLiability: string | null
  compensationAmount: number | null
  createdAt: string
  resolvedAt: string | null
  createdByName: string | null
  createdByRole: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  OPEN: { label: 'E Hapur', color: 'bg-yellow-500', icon: '📂' },
  UNDER_REVIEW: { label: 'Në Shqyrtim', color: 'bg-blue-500', icon: '🔍' },
  EVIDENCE_COMPLETE: { label: 'Provat Gati', color: 'bg-purple-500', icon: '📋' },
  RESOLVED: { label: 'E Zgjidhur', color: 'bg-green-500', icon: '✅' }
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

export default function DisputesPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  // State
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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
          // Invalid user data
        }
      }
    } else {
      setLoading(false)
    }
  }, [])

  // Fetch disputes
  const fetchDisputes = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const endpoint = userRole === 'ADMIN' ? '/api/disputes/all' : '/api/disputes/my'
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter })
      })

      const res = await fetch(`${API_URL}${endpoint}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error('Failed to fetch disputes')
      }

      const data = await res.json()
      setDisputes(data.disputes || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (err) {
      setError('Gabim gjatë marrjes së disputes')
    } finally {
      setLoading(false)
    }
  }, [API_URL, isAuthenticated, userRole, page, statusFilter])

  useEffect(() => {
    if (isAuthenticated && userRole) {
      fetchDisputes()
    }
  }, [isAuthenticated, userRole, fetchDisputes])

  // Not authenticated
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm w-full border border-slate-700">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Autentikim i Nevojshëm</h1>
          <p className="text-slate-400 mb-6">Hyni në llogari për të parë disputes.</p>
          <Link href="/login" className="block w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors">
            Hyr në Llogari
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
          <p className="text-slate-400">Duke ngarkuar disputes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-white">
              Vector<span className="text-cyan-400">Node</span>
            </Link>
            <span className="text-slate-500">/</span>
            <h1 className="text-lg font-semibold text-white">Disputes</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-slate-700 rounded-lg text-sm text-slate-300">
              {userRole === 'ADMIN' && '👑 Admin'}
              {userRole === 'SHIPPER' && '📦 Dërgues'}
              {userRole === 'CARRIER' && '🚛 Transportues'}
              {userRole === 'WAREHOUSE' && '🏭 Magazinë'}
              {userRole === 'DRIVER' && '🚗 Shofer'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Statusi:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">Të gjitha</option>
              <option value="OPEN">E Hapur</option>
              <option value="UNDER_REVIEW">Në Shqyrtim</option>
              <option value="EVIDENCE_COMPLETE">Provat Gati</option>
              <option value="RESOLVED">E Zgjidhur</option>
            </select>
          </div>

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

        {/* Disputes List */}
        {disputes.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Asnjë Dispute</h2>
            <p className="text-slate-400">Nuk keni disputes aktive në këtë moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => {
              const statusConf = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.OPEN
              const typeConf = TYPE_CONFIG[dispute.type] || { label: dispute.type, icon: '📋' }
              const liabilityConf = LIABILITY_CONFIG[dispute.suggestedLiability || 'UNKNOWN']

              return (
                <Link
                  key={dispute.id}
                  href={`/disputes/${dispute.id}`}
                  className="block bg-slate-800 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-colors overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{typeConf.icon}</span>
                          <div>
                            <h3 className="text-white font-medium">{typeConf.label}</h3>
                            <p className="text-slate-500 text-sm">ID: {dispute.id.slice(0, 8)}...</p>
                          </div>
                        </div>

                        <p className="text-slate-300 text-sm line-clamp-2 mb-3">
                          {dispute.damageDescription}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {/* Status badge */}
                          <span className={`px-2.5 py-1 rounded-full text-white text-xs font-medium ${statusConf.color}`}>
                            {statusConf.icon} {statusConf.label}
                          </span>

                          {/* Suggested liability */}
                          {dispute.suggestedLiability && (
                            <span className={`${liabilityConf.color}`}>
                              Sugjeruar: {liabilityConf.label}
                              {dispute.suggestedLiabilityScore && (
                                <span className="text-slate-500 ml-1">({dispute.suggestedLiabilityScore}%)</span>
                              )}
                            </span>
                          )}

                          {/* Final liability */}
                          {dispute.finalLiability && (
                            <span className="text-green-400 font-medium">
                              Vendim: {LIABILITY_CONFIG[dispute.finalLiability]?.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Meta */}
                      <div className="text-right flex-shrink-0">
                        {dispute.estimatedValue && (
                          <p className="text-white font-semibold">€{dispute.estimatedValue.toFixed(2)}</p>
                        )}
                        {dispute.compensationAmount && (
                          <p className="text-green-400 text-sm">Kompensim: €{dispute.compensationAmount.toFixed(2)}</p>
                        )}
                        <p className="text-slate-500 text-xs mt-2">
                          {new Date(dispute.createdAt).toLocaleDateString('sq-AL')}
                        </p>
                        {dispute.resolvedAt && (
                          <p className="text-green-400/70 text-xs">
                            Zgjidhur: {new Date(dispute.resolvedAt).toLocaleDateString('sq-AL')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 bg-slate-700/30 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-slate-400 text-sm">
                      Krijuar nga: {dispute.createdByName || dispute.createdByRole}
                    </span>
                    <span className="text-cyan-400 text-sm">Shiko Detajet →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
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
      </main>
    </div>
  )
}
