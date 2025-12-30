'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Verification {
  type: string
  label: string
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'EXPIRED' | 'MISSING'
}

interface Review {
  id: string
  rating: number
  communicationRating?: number
  punctualityRating?: number
  conditionRating?: number
  comment?: string
  carrierResponse?: string
  createdAt: string
}

interface CarrierProfile {
  id: string
  slug: string
  companyName: string
  logo?: string
  description?: string
  foundedYear?: number
  website?: string
  city?: string
  country?: string
  coverageCountries: string[]
  verified: boolean
  verificationStatus: string
  subscriptionTier: string
  rating: number
  totalDeliveries: number
  totalReviews: number
  onTimeDeliveryRate: number
  avgResponseTime: number
  cancellationRate: number
  successRate: number
  fleetSize: number
  vehicleTypes: string[]
  vehicleTypeCounts: Record<string, number>
  verificationChecklist: Verification[]
  reviews: Review[]
  contactName?: string
  memberSince: string
}

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  'TRUCK_SMALL': 'Kamion i vogël',
  'TRUCK_MEDIUM': 'Kamion mesatar',
  'TRUCK_LARGE': 'Kamion i madh',
  'TRUCK_HEAVY': 'Kamion i rëndë',
  'VAN': 'Furgon',
  'REFRIGERATED': 'Frigorifer',
  'TANKER': 'Cisternë'
}

const COUNTRY_FLAGS: Record<string, string> = {
  'AL': '🇦🇱',
  'XK': '🇽🇰',
  'IT': '🇮🇹',
  'GR': '🇬🇷',
  'MK': '🇲🇰',
  'ME': '🇲🇪',
  'RS': '🇷🇸',
  'DE': '🇩🇪',
  'AT': '🇦🇹',
  'CH': '🇨🇭'
}

export default function CarrierPublicProfile() {
  const params = useParams()
  const slug = params.slug as string

  const [carrier, setCarrier] = useState<CarrierProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'fleet'>('overview')

  useEffect(() => {
    if (!slug) return

    const fetchCarrier = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/carriers/slug/${slug}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('Transportuesi nuk u gjet')
          } else {
            setError('Gabim në ngarkim')
          }
          return
        }
        const data = await res.json()
        setCarrier(data.carrier)
      } catch {
        setError('Gabim në lidhje me serverin')
      } finally {
        setLoading(false)
      }
    }

    fetchCarrier()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (error || !carrier) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{error || 'Transportuesi nuk u gjet'}</h1>
          <Link href="/carriers" className="text-cyan-400 hover:underline">
            ← Kthehu te lista
          </Link>
        </div>
      </div>
    )
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="text-green-500">✓</span>
      case 'PENDING':
        return <span className="text-yellow-500">⏳</span>
      case 'REJECTED':
      case 'EXPIRED':
      case 'MISSING':
      default:
        return <span className="text-red-500">✗</span>
    }
  }

  const getStatusBadge = () => {
    if (carrier.verificationStatus === 'suspended') {
      return <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-medium rounded-full">Suspended</span>
    }
    if (carrier.verified) {
      return <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full">✓ Verified</span>
    }
    if (carrier.subscriptionTier === 'FREE_TRIAL') {
      return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">Trial</span>
    }
    return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-medium rounded-full">Unverified</span>
  }

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className={`text-yellow-400 ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>★</span>)
      } else if (i === fullStars && hasHalf) {
        stars.push(<span key={i} className={`text-yellow-400 ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>★</span>)
      } else {
        stars.push(<span key={i} className={`text-slate-600 ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>★</span>)
      }
    }
    return stars
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Vector<span className="text-cyan-400">Node</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/carriers" className="text-slate-300 hover:text-white transition-colors">
              Të gjithë transportuesit
            </Link>
            <Link href="/login" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors">
              Hyr
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {carrier.logo ? (
                <img src={carrier.logo} alt={carrier.companyName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl md:text-5xl text-slate-500">🚚</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{carrier.companyName}</h1>
                {getStatusBadge()}
              </div>

              {/* Location */}
              {(carrier.city || carrier.country) && (
                <p className="text-slate-400 mb-3">
                  📍 {[carrier.city, carrier.country].filter(Boolean).join(', ')}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">{renderStars(carrier.rating, 'lg')}</div>
                <span className="text-2xl font-bold text-white">{carrier.rating.toFixed(1)}</span>
                <span className="text-slate-400">({carrier.totalReviews} vlerësime)</span>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="bg-slate-800 px-3 py-2 rounded-lg">
                  <span className="text-slate-400">Transportime:</span>
                  <span className="text-white font-semibold ml-2">{carrier.totalDeliveries}</span>
                </div>
                <div className="bg-slate-800 px-3 py-2 rounded-lg">
                  <span className="text-slate-400">Flota:</span>
                  <span className="text-white font-semibold ml-2">{carrier.fleetSize} mjete</span>
                </div>
                <div className="bg-slate-800 px-3 py-2 rounded-lg">
                  <span className="text-slate-400">Anëtar që prej:</span>
                  <span className="text-white font-semibold ml-2">{formatDate(carrier.memberSince)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors">
                Kërko ofertë
              </button>
              <button className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors">
                Fto në ngarkesë
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Përmbledhje' },
              { id: 'reviews', label: `Vlerësime (${carrier.totalReviews})` },
              { id: 'fleet', label: 'Flota' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              {carrier.description && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h2 className="text-lg font-semibold text-white mb-3">Rreth kompanisë</h2>
                  <p className="text-slate-300">{carrier.description}</p>
                </div>
              )}

              {/* Stats */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-lg font-semibold text-white mb-4">Statistika</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-3xl font-bold text-green-400">{carrier.onTimeDeliveryRate}%</div>
                    <div className="text-sm text-slate-400 mt-1">Në kohë</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-3xl font-bold text-cyan-400">{carrier.successRate}%</div>
                    <div className="text-sm text-slate-400 mt-1">Sukses</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-400">{carrier.avgResponseTime}m</div>
                    <div className="text-sm text-slate-400 mt-1">Përgjigje mesatare</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-3xl font-bold text-red-400">{carrier.cancellationRate}%</div>
                    <div className="text-sm text-slate-400 mt-1">Anulime</div>
                  </div>
                </div>
              </div>

              {/* Coverage */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-lg font-semibold text-white mb-4">Zonat e operimit</h2>
                <div className="flex flex-wrap gap-2">
                  {carrier.coverageCountries?.map((country: string) => (
                    <span key={country} className="px-3 py-2 bg-slate-700 rounded-lg text-white">
                      {COUNTRY_FLAGS[country] || ''} {country}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              {carrier.reviews.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Vlerësimet e fundit</h2>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="text-cyan-400 hover:underline text-sm"
                    >
                      Shiko të gjitha →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {carrier.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b border-slate-700 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-slate-400 text-sm">{formatDate(review.createdAt)}</span>
                        </div>
                        {review.comment && (
                          <p className="text-slate-300 text-sm">{review.comment}</p>
                        )}
                        {review.carrierResponse && (
                          <div className="mt-2 pl-4 border-l-2 border-cyan-500">
                            <p className="text-slate-400 text-sm">
                              <span className="text-cyan-400">Përgjigje:</span> {review.carrierResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Verification Checklist */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-lg font-semibold text-white mb-4">Verifikimet</h2>
                <div className="space-y-3">
                  {carrier.verificationChecklist.map((v) => (
                    <div key={v.type} className="flex items-center justify-between">
                      <span className="text-slate-300">{v.label}</span>
                      {getVerificationIcon(v.status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Info */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-lg font-semibold text-white mb-4">Informacion</h2>
                <div className="space-y-3 text-sm">
                  {carrier.foundedYear && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Themeluar:</span>
                      <span className="text-white">{carrier.foundedYear}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flota:</span>
                    <span className="text-white">{carrier.fleetSize} mjete</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plani:</span>
                    <span className="text-white">{carrier.subscriptionTier.replace('_', ' ')}</span>
                  </div>
                  {carrier.website && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Website:</span>
                      <a href={carrier.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                        Vizito →
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Fleet Types */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-lg font-semibold text-white mb-4">Tipet e mjeteve</h2>
                <div className="space-y-2">
                  {Object.entries(carrier.vehicleTypeCounts || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-slate-300">{VEHICLE_TYPE_LABELS[type] || type}</span>
                      <span className="px-2 py-1 bg-slate-700 rounded text-white text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="max-w-3xl">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">{carrier.rating.toFixed(1)}</div>
                  <div className="flex justify-center mt-2">{renderStars(carrier.rating, 'lg')}</div>
                  <div className="text-slate-400 text-sm mt-1">{carrier.totalReviews} vlerësime</div>
                </div>
              </div>
            </div>

            {carrier.reviews.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                Nuk ka vlerësime ende
              </div>
            ) : (
              <div className="space-y-4">
                {carrier.reviews.map((review) => (
                  <div key={review.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="font-semibold text-white">{review.rating}/5</span>
                      </div>
                      <span className="text-slate-400 text-sm">{formatDate(review.createdAt)}</span>
                    </div>

                    {/* Detailed ratings */}
                    {(review.communicationRating || review.punctualityRating || review.conditionRating) && (
                      <div className="flex gap-4 mb-3 text-sm">
                        {review.communicationRating && (
                          <span className="text-slate-400">Komunikim: <span className="text-white">{review.communicationRating}/5</span></span>
                        )}
                        {review.punctualityRating && (
                          <span className="text-slate-400">Punktualitet: <span className="text-white">{review.punctualityRating}/5</span></span>
                        )}
                        {review.conditionRating && (
                          <span className="text-slate-400">Gjendje: <span className="text-white">{review.conditionRating}/5</span></span>
                        )}
                      </div>
                    )}

                    {review.comment && (
                      <p className="text-slate-300">{review.comment}</p>
                    )}

                    {review.carrierResponse && (
                      <div className="mt-4 pl-4 border-l-2 border-cyan-500 bg-slate-700/30 p-3 rounded-r-lg">
                        <p className="text-sm text-slate-400 mb-1">Përgjigje nga transportuesi:</p>
                        <p className="text-slate-300">{review.carrierResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(carrier.vehicleTypeCounts || {}).map(([type, count]) => (
              <div key={type} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="text-4xl mb-3">
                  {type.includes('REFRIGERATED') ? '🧊' : type.includes('TANKER') ? '⛽' : type.includes('VAN') ? '🚐' : '🚚'}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{VEHICLE_TYPE_LABELS[type] || type}</h3>
                <p className="text-slate-400">{count} mjete</p>
              </div>
            ))}

            {Object.keys(carrier.vehicleTypeCounts || {}).length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400">
                Nuk ka informacion për flotën
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-400">
          <p>© 2024 VectorNode. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </footer>
    </div>
  )
}
