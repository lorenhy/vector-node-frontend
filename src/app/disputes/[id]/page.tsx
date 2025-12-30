'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// Types
interface ScanLog {
  id: string
  action: string
  previousStatus: string
  newStatus: string
  scannedByRole: string
  scannedByName: string
  scannedAt: string
  warehouseName?: string
  hasDamage: boolean
  damageDescription?: string
}

interface Photo {
  id: string
  type: string
  imageUrl: string
  uploadedByName: string
  uploadedAt: string
}

interface TimelineEntry {
  type: string
  timestamp: string
  action?: string
  actor: string
  role: string
  hasDamage?: boolean
  damageDescription?: string
  photoType?: string
  url?: string
}

interface Comment {
  id: string
  authorId: string
  authorRole: string
  authorName: string
  message: string
  attachments: any[] | null
  isInternal: boolean
  createdAt: string
}

interface Evidence {
  id: string
  type: string
  title: string
  description: string
  fileUrl: string
  uploadedByName: string
  uploadedAt: string
}

interface Dispute {
  id: string
  shipmentId: string
  unitId: string
  type: string
  status: string
  damageDescription: string
  estimatedValue: number | null
  isAutoCreated: boolean
  evidenceSnapshot: {
    scanLogs: ScanLog[]
    photos: Photo[]
    timeline: TimelineEntry[]
    pod?: any
  } | null
  suggestedLiability: string | null
  suggestedLiabilityScore: number | null
  liabilityReason: string | null
  finalLiability: string | null
  resolutionNotes: string | null
  compensationAmount: number | null
  ratingImpactApplied: boolean
  ratingImpactValue: number | null
  suspensionApplied: boolean
  createdById: string
  createdByRole: string
  createdByName: string | null
  resolvedById: string | null
  resolvedByName: string | null
  createdAt: string
  reviewStartedAt: string | null
  evidenceLockedAt: string | null
  resolvedAt: string | null
  comments: Comment[]
  evidence: Evidence[]
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

const ACTION_LABELS: Record<string, string> = {
  PICKUP: 'Marrja',
  WAREHOUSE_INBOUND: 'Hyrje Magazinë',
  WAREHOUSE_OUTBOUND: 'Dalje Magazinë',
  DRIVER_HANDOVER: 'Dorëzim Shoferit',
  DELIVERY: 'Dorëzimi',
  DAMAGE_REPORT: 'Raport Dëmtimi'
}

export default function DisputeDetailPage() {
  const params = useParams()
  const disputeId = params.id as string
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  // State
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Form states
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'timeline' | 'comments' | 'resolve'>('overview')
  const [newComment, setNewComment] = useState('')
  const [isInternalComment, setIsInternalComment] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Resolution form (admin)
  const [finalLiability, setFinalLiability] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [compensationAmount, setCompensationAmount] = useState('')
  const [applyRatingImpact, setApplyRatingImpact] = useState(true)
  const [ratingImpactValue, setRatingImpactValue] = useState('-0.5')

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
          setUserId(user.id)
        } catch {
          // Invalid
        }
      }
    } else {
      setLoading(false)
    }
  }, [])

  // Fetch dispute
  const fetchDispute = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/disputes/${disputeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        if (res.status === 403) {
          setError('Nuk keni akses në këtë dispute')
        } else if (res.status === 404) {
          setError('Dispute nuk u gjet')
        } else {
          setError('Gabim gjatë marrjes së dispute')
        }
        return
      }

      const data = await res.json()
      setDispute(data.dispute)
    } catch {
      setError('Gabim në lidhje me serverin')
    } finally {
      setLoading(false)
    }
  }, [API_URL, disputeId, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDispute()
    }
  }, [isAuthenticated, fetchDispute])

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !dispute) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/disputes/${disputeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: newComment,
          isInternal: isInternalComment
        })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gabim gjatë shtimit të komentit')
        return
      }

      setNewComment('')
      fetchDispute()
    } catch {
      alert('Gabim në lidhje me serverin')
    } finally {
      setSubmitting(false)
    }
  }

  // Update status (admin)
  const handleUpdateStatus = async (newStatus: string) => {
    if (!dispute) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/disputes/${disputeId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gabim gjatë përditësimit')
        return
      }

      fetchDispute()
    } catch {
      alert('Gabim në lidhje me serverin')
    } finally {
      setSubmitting(false)
    }
  }

  // Resolve dispute (admin)
  const handleResolve = async () => {
    if (!dispute || !finalLiability) {
      alert('Zgjidh përgjegjësinë finale')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          finalLiability,
          resolutionNotes,
          compensationAmount: compensationAmount ? parseFloat(compensationAmount) : null,
          applyRatingImpact,
          ratingImpactValue: applyRatingImpact ? parseFloat(ratingImpactValue) : null
        })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gabim gjatë zgjidhjes')
        return
      }

      fetchDispute()
      setActiveTab('overview')
    } catch {
      alert('Gabim në lidhje me serverin')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Duke ngarkuar dispute...</p>
        </div>
      </div>
    )
  }

  // Error
  if (error || !dispute) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm w-full border border-slate-700">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">{error || 'Dispute nuk u gjet'}</h1>
          <Link href="/disputes" className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors mt-6">
            Kthehu te Disputes
          </Link>
        </div>
      </div>
    )
  }

  const statusConf = STATUS_CONFIG[dispute.status]
  const typeConf = TYPE_CONFIG[dispute.type] || { label: dispute.type, icon: '📋' }
  const isLocked = dispute.status === 'EVIDENCE_COMPLETE' || dispute.status === 'RESOLVED'
  const isAdmin = userRole === 'ADMIN'

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/disputes" className="text-slate-400 hover:text-white">
              ← Kthehu
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{typeConf.icon}</span>
                {typeConf.label}
              </h1>
              <p className="text-slate-500 text-sm">ID: {dispute.id}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-white text-sm font-medium ${statusConf.bgColor}`}>
              {statusConf.label}
            </span>
          </div>
        </div>
      </header>

      {/* Admin Status Controls */}
      {isAdmin && dispute.status !== 'RESOLVED' && (
        <div className="bg-slate-800/50 border-b border-slate-700">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <span className="text-slate-400 text-sm">Ndrysho Statusin:</span>
            {dispute.status === 'OPEN' && (
              <button
                onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Fillo Shqyrtimin
              </button>
            )}
            {dispute.status === 'UNDER_REVIEW' && (
              <button
                onClick={() => handleUpdateStatus('EVIDENCE_COMPLETE')}
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Kyç Provat
              </button>
            )}
            {dispute.status === 'EVIDENCE_COMPLETE' && (
              <button
                onClick={() => setActiveTab('resolve')}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Zgjidh Dispute
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {(['overview', 'evidence', 'timeline', 'comments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'overview' && 'Përmbledhje'}
                {tab === 'evidence' && 'Provat'}
                {tab === 'timeline' && 'Kronologjia'}
                {tab === 'comments' && `Komentet (${dispute.comments.length})`}
              </button>
            ))}
            {isAdmin && dispute.status === 'EVIDENCE_COMPLETE' && (
              <button
                onClick={() => setActiveTab('resolve')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'resolve'
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Zgjidh
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Damage Info */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h2 className="text-white font-semibold mb-4">Përshkrimi i Dëmtimit</h2>
                <p className="text-slate-300">{dispute.damageDescription}</p>
                {dispute.estimatedValue && (
                  <p className="text-cyan-400 font-medium mt-3">
                    Vlera e Vlerësuar: €{dispute.estimatedValue.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Suggested Liability */}
              {dispute.suggestedLiability && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <h2 className="text-white font-semibold mb-4">Analiza e Përgjegjësisë</h2>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xl font-bold ${LIABILITY_CONFIG[dispute.suggestedLiability].color}`}>
                      {LIABILITY_CONFIG[dispute.suggestedLiability].label}
                    </span>
                    {dispute.suggestedLiabilityScore && (
                      <span className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-300">
                        {dispute.suggestedLiabilityScore}% konfidencë
                      </span>
                    )}
                  </div>
                  {dispute.liabilityReason && (
                    <p className="text-slate-400 text-sm">{dispute.liabilityReason}</p>
                  )}
                </div>
              )}

              {/* Resolution (if resolved) */}
              {dispute.status === 'RESOLVED' && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <h2 className="text-green-400 font-semibold mb-4">Vendimi Final</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 text-sm">Përgjegjësia:</span>
                      <p className={`font-bold ${LIABILITY_CONFIG[dispute.finalLiability || 'UNKNOWN'].color}`}>
                        {LIABILITY_CONFIG[dispute.finalLiability || 'UNKNOWN'].label}
                      </p>
                    </div>
                    {dispute.compensationAmount && (
                      <div>
                        <span className="text-slate-400 text-sm">Kompensimi:</span>
                        <p className="text-white font-semibold">€{dispute.compensationAmount.toFixed(2)}</p>
                      </div>
                    )}
                    {dispute.resolutionNotes && (
                      <div>
                        <span className="text-slate-400 text-sm">Shënime:</span>
                        <p className="text-slate-300">{dispute.resolutionNotes}</p>
                      </div>
                    )}
                    {dispute.ratingImpactApplied && dispute.ratingImpactValue && (
                      <p className="text-red-400 text-sm">
                        Impakt në Rating: {dispute.ratingImpactValue} yje
                      </p>
                    )}
                    <p className="text-slate-500 text-sm">
                      Zgjidhur nga: {dispute.resolvedByName} • {new Date(dispute.resolvedAt!).toLocaleString('sq-AL')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Meta Info */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h2 className="text-white font-semibold mb-4">Informacione</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Krijuar nga:</span>
                    <span className="text-white">{dispute.createdByName || dispute.createdByRole}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Krijuar më:</span>
                    <span className="text-white">{new Date(dispute.createdAt).toLocaleString('sq-AL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Krijim:</span>
                    <span className="text-white">{dispute.isAutoCreated ? 'Automatik' : 'Manual'}</span>
                  </div>
                  {dispute.reviewStartedAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shqyrtimi filloi:</span>
                      <span className="text-white">{new Date(dispute.reviewStartedAt).toLocaleString('sq-AL')}</span>
                    </div>
                  )}
                  {dispute.evidenceLockedAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Provat u kyçën:</span>
                      <span className="text-white">{new Date(dispute.evidenceLockedAt).toLocaleString('sq-AL')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Photos Preview */}
              {dispute.evidenceSnapshot?.photos && dispute.evidenceSnapshot.photos.length > 0 && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <h2 className="text-white font-semibold mb-4">Fotot ({dispute.evidenceSnapshot.photos.length})</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {dispute.evidenceSnapshot.photos.slice(0, 6).map((photo, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-700">
                        <img src={photo.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  {dispute.evidenceSnapshot.photos.length > 6 && (
                    <button
                      onClick={() => setActiveTab('evidence')}
                      className="mt-3 text-cyan-400 text-sm hover:underline"
                    >
                      Shiko të gjitha fotot →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Evidence Tab */}
        {activeTab === 'evidence' && (
          <div className="space-y-6">
            {/* Photos */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold mb-4">Fotot e Dokumentuara</h2>
              {dispute.evidenceSnapshot?.photos && dispute.evidenceSnapshot.photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dispute.evidenceSnapshot.photos.map((photo, i) => (
                    <div key={i} className="space-y-2">
                      <div className="aspect-square rounded-lg overflow-hidden bg-slate-700">
                        <img src={photo.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">
                          {photo.type}
                        </span>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(photo.uploadedAt).toLocaleDateString('sq-AL')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">Asnjë foto</p>
              )}
            </div>

            {/* Additional Evidence */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold mb-4">Prova Shtesë</h2>
              {dispute.evidence.length > 0 ? (
                <div className="space-y-3">
                  {dispute.evidence.map((ev) => (
                    <div key={ev.id} className="flex items-center gap-4 p-3 bg-slate-700 rounded-lg">
                      <span className="text-2xl">
                        {ev.type === 'PHOTO' && '🖼️'}
                        {ev.type === 'DOCUMENT' && '📄'}
                        {ev.type === 'VIDEO' && '🎥'}
                        {ev.type === 'EXTERNAL_REPORT' && '📋'}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-medium">{ev.title}</p>
                        {ev.description && <p className="text-slate-400 text-sm">{ev.description}</p>}
                        <p className="text-slate-500 text-xs">
                          Nga: {ev.uploadedByName} • {new Date(ev.uploadedAt).toLocaleString('sq-AL')}
                        </p>
                      </div>
                      {ev.fileUrl && (
                        <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">
                          Shiko
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">Asnjë provë shtesë</p>
              )}
            </div>

            {/* POD */}
            {dispute.evidenceSnapshot?.pod && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h2 className="text-white font-semibold mb-4">Proof of Delivery</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Marrësi:</p>
                    <p className="text-white">{dispute.evidenceSnapshot.pod.recipientName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Shoferi:</p>
                    <p className="text-white">{dispute.evidenceSnapshot.pod.driverName}</p>
                  </div>
                </div>
                {dispute.evidenceSnapshot.pod.signatureImage && (
                  <div className="mt-4">
                    <p className="text-slate-400 text-sm mb-2">Firma:</p>
                    <img
                      src={dispute.evidenceSnapshot.pod.signatureImage}
                      alt="Signature"
                      className="max-w-xs bg-white rounded-lg p-2"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-white font-semibold mb-6">Kronologjia e Ngjarjeve</h2>
            {dispute.evidenceSnapshot?.timeline && dispute.evidenceSnapshot.timeline.length > 0 ? (
              <div className="space-y-0">
                {dispute.evidenceSnapshot.timeline.map((entry, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${entry.hasDamage ? 'bg-red-500' : 'bg-cyan-500'}`}></div>
                      {i < dispute.evidenceSnapshot!.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-600 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium">
                          {entry.type === 'SCAN' && (ACTION_LABELS[entry.action || ''] || entry.action)}
                          {entry.type === 'PHOTO' && `Foto: ${entry.photoType}`}
                        </span>
                        {entry.hasDamage && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                            Dëmtim
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{entry.actor} ({entry.role})</p>
                      {entry.damageDescription && (
                        <p className="text-red-400 text-sm mt-1">{entry.damageDescription}</p>
                      )}
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(entry.timestamp).toLocaleString('sq-AL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">Asnjë ngjarje në kronologji</p>
            )}
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            {/* Comments List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold mb-4">Komentet</h2>
              {dispute.comments.length > 0 ? (
                <div className="space-y-4">
                  {dispute.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-lg ${comment.isInternal ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-slate-700'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-medium">{comment.authorName || comment.authorRole}</span>
                        <span className="text-slate-500 text-xs">{comment.authorRole}</span>
                        {comment.isInternal && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            Intern
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300">{comment.message}</p>
                      <p className="text-slate-500 text-xs mt-2">
                        {new Date(comment.createdAt).toLocaleString('sq-AL')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">Asnjë koment</p>
              )}
            </div>

            {/* Add Comment */}
            {!isLocked && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold mb-4">Shto Koment</h3>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Shkruaj komentin..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none mb-4"
                  rows={3}
                />
                {isAdmin && (
                  <label className="flex items-center gap-2 mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500"
                    />
                    <span className="text-slate-300 text-sm">Koment intern (vetëm për admin)</span>
                  </label>
                )}
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submitting}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  {submitting ? 'Duke dërguar...' : 'Dërgo Komentin'}
                </button>
              </div>
            )}

            {isLocked && (
              <div className="bg-slate-700/50 rounded-xl p-4 text-center text-slate-400">
                Dispute është e kyçur. Nuk mund të shtohen komente të reja.
              </div>
            )}
          </div>
        )}

        {/* Resolve Tab (Admin Only) */}
        {activeTab === 'resolve' && isAdmin && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-xl mb-6">Zgjidh Dispute</h2>

              <div className="space-y-6">
                {/* Final Liability */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Përgjegjësia Finale <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(LIABILITY_CONFIG).map(([key, conf]) => (
                      <button
                        key={key}
                        onClick={() => setFinalLiability(key)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          finalLiability === key
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <span className={`font-medium ${conf.color}`}>{conf.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compensation */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Kompensimi (EUR)</label>
                  <input
                    type="number"
                    value={compensationAmount}
                    onChange={(e) => setCompensationAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500"
                  />
                </div>

                {/* Rating Impact */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyRatingImpact}
                      onChange={(e) => setApplyRatingImpact(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500"
                    />
                    <span className="text-slate-300">Apliko impakt në rating</span>
                  </label>
                  {applyRatingImpact && (
                    <input
                      type="number"
                      step="0.1"
                      value={ratingImpactValue}
                      onChange={(e) => setRatingImpactValue(e.target.value)}
                      placeholder="-0.5"
                      className="mt-2 w-32 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                    />
                  )}
                </div>

                {/* Resolution Notes */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Shënime Zgjidhje</label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Arsyetimi i vendimit..."
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 resize-none"
                    rows={4}
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleResolve}
                  disabled={!finalLiability || submitting}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white rounded-xl font-semibold text-lg transition-colors"
                >
                  {submitting ? 'Duke procesuar...' : 'Zgjidh Dispute'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
