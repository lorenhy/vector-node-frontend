'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Verification {
  type: string
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'EXPIRED' | 'MISSING'
  documentUrl: string | null
  expiresAt: string | null
  rejectionReason: string | null
}

const VERIFICATION_LABELS: Record<string, { title: string; description: string; icon: string }> = {
  'EMAIL_PHONE': {
    title: 'Email & Telefon',
    description: 'Verifikimi i emailit dhe numrit të telefonit',
    icon: '📧'
  },
  'COMPANY_REG': {
    title: 'Regjistrimi i kompanisë',
    description: 'Certifikata e regjistrimit të biznesit (QKB/ARBK)',
    icon: '🏢'
  },
  'VAT_NIPT': {
    title: 'NIPT / VAT',
    description: 'Numri i identifikimit tatimor',
    icon: '📋'
  },
  'TRANSPORT_LICENSE': {
    title: 'Licenca e transportit',
    description: 'Licenca për transport mallrash',
    icon: '🚛'
  },
  'INSURANCE': {
    title: 'Siguracion',
    description: 'Polica e sigurimit për transportin',
    icon: '🛡️'
  },
  'BANK_ACCOUNT': {
    title: 'Llogari bankare',
    description: 'Verifikimi i llogarisë bankare të kompanisë',
    icon: '🏦'
  }
}

export default function CarrierVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadUrl, setUploadUrl] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [expiryDate, setExpiryDate] = useState('')

  useEffect(() => {
    fetchVerifications()
  }, [])

  const fetchVerifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/carriers/verifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setVerifications(data.verifications)
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (type: string) => {
    if (!uploadUrl.trim()) return

    setUploading(type)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/carriers/verifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          documentUrl: uploadUrl,
          expiresAt: expiryDate || undefined
        })
      })

      if (res.ok) {
        await fetchVerifications()
        setUploadUrl('')
        setExpiryDate('')
        setSelectedType(null)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Verifikuar</span>
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">Në pritje</span>
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">Refuzuar</span>
      case 'EXPIRED':
        return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded">Skaduar</span>
      default:
        return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs font-medium rounded">Mungon</span>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="text-green-500 text-xl">✓</span>
      case 'PENDING':
        return <span className="text-yellow-500 text-xl">⏳</span>
      case 'REJECTED':
      case 'EXPIRED':
      case 'MISSING':
      default:
        return <span className="text-red-500 text-xl">✗</span>
    }
  }

  const completedCount = verifications.filter(v => v.status === 'APPROVED').length
  const totalCount = verifications.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/carrier" className="text-slate-400 hover:text-white transition-colors">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold text-white">Verifikimet</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Card */}
        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-xl p-6 border border-cyan-500/30 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Progresi i verifikimit</h2>
              <p className="text-slate-300">{completedCount} nga {totalCount} të kompletuara</p>
            </div>
            <div className="text-right">
              <span className={`text-3xl font-bold ${progress === 100 ? 'text-green-400' : 'text-cyan-400'}`}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-cyan-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <p className="text-green-400 mt-3 flex items-center gap-2">
              <span>✓</span> Të gjitha verifikimet janë kompletuar! Badge &quot;Verified&quot; do aktivizohet brenda 24 orëve.
            </p>
          )}
        </div>

        {/* Why Verification Matters */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Pse të verifikohesh?</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="font-medium text-white mb-1">Badge &quot;Verified&quot;</h4>
              <p className="text-sm text-slate-400">Shfaqesh si transportues i besueshëm</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">📈</div>
              <h4 className="font-medium text-white mb-1">Prioritet në listime</h4>
              <p className="text-sm text-slate-400">Ofertat tuaja renditen më lart</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-medium text-white mb-1">Më shumë fitim</h4>
              <p className="text-sm text-slate-400">Klientët zgjedhin transportues të verifikuar</p>
            </div>
          </div>
        </div>

        {/* Verifications List */}
        <div className="space-y-4">
          {verifications.map((v) => {
            const info = VERIFICATION_LABELS[v.type]
            const isAutoVerified = v.type === 'EMAIL_PHONE'

            return (
              <div key={v.type} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{info?.icon || '📄'}</div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-white">{info?.title || v.type}</h3>
                          {getStatusBadge(v.status)}
                        </div>
                        <p className="text-slate-400 text-sm">{info?.description}</p>

                        {v.status === 'REJECTED' && v.rejectionReason && (
                          <p className="text-red-400 text-sm mt-2">
                            Arsyeja: {v.rejectionReason}
                          </p>
                        )}

                        {v.status === 'EXPIRED' && v.expiresAt && (
                          <p className="text-orange-400 text-sm mt-2">
                            Skadoi më: {new Date(v.expiresAt).toLocaleDateString('sq-AL')}
                          </p>
                        )}

                        {v.documentUrl && v.status !== 'MISSING' && (
                          <a
                            href={v.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 text-sm hover:underline mt-2 inline-block"
                          >
                            Shiko dokumentin →
                          </a>
                        )}
                      </div>
                    </div>
                    <div>{getStatusIcon(v.status)}</div>
                  </div>

                  {/* Upload section for non-approved items */}
                  {!isAutoVerified && v.status !== 'APPROVED' && v.status !== 'PENDING' && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      {selectedType === v.type ? (
                        <div className="space-y-3">
                          <input
                            type="url"
                            placeholder="URL e dokumentit (Google Drive, Dropbox, etj.)"
                            value={uploadUrl}
                            onChange={(e) => setUploadUrl(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                          {(v.type === 'TRANSPORT_LICENSE' || v.type === 'INSURANCE') && (
                            <input
                              type="date"
                              placeholder="Data e skadencës"
                              value={expiryDate}
                              onChange={(e) => setExpiryDate(e.target.value)}
                              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpload(v.type)}
                              disabled={uploading === v.type || !uploadUrl.trim()}
                              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {uploading === v.type ? 'Duke ngarkuar...' : 'Ngarko'}
                            </button>
                            <button
                              onClick={() => { setSelectedType(null); setUploadUrl(''); setExpiryDate(''); }}
                              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                              Anulo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedType(v.type)}
                          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                        >
                          + Ngarko dokument
                        </button>
                      )}
                    </div>
                  )}

                  {isAutoVerified && v.status !== 'APPROVED' && (
                    <p className="text-slate-400 text-sm mt-4 pt-4 border-t border-slate-700">
                      Ky verifikim bëhet automatikisht kur konfirmoni emailin dhe numrin e telefonit.
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Note */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">
            <strong className="text-white">Shënim:</strong> Dokumentet shqyrtohen brenda 24-48 orëve.
            Sigurohuni që dokumentet janë të qarta dhe të lexueshme.
            Dokumentet e skaduara duhet të rinovohen.
          </p>
        </div>
      </div>
    </div>
  )
}
