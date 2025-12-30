'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Carrier {
  id: string
  slug: string
  companyName: string
  logo?: string
  city?: string
  country?: string
  rating: number
  totalDeliveries: number
  totalReviews: number
  verified: boolean
  verificationStatus: string
  subscriptionTier: string
  fleetSize: number
  vehicleTypes: string[]
  coverageCountries: string[]
  onTimeDeliveryRate: number
  createdAt: string
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

export default function CarriersListPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')

  useEffect(() => {
    const fetchCarriers = async () => {
      setLoading(true)
      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/carriers?page=${page}&limit=12`
        if (verifiedOnly) url += '&verified=true'
        if (selectedCountry) url += `&country=${selectedCountry}`

        const res = await fetch(url)
        const data = await res.json()
        setCarriers(data.carriers || [])
        setTotalPages(data.pagination?.pages || 1)
      } catch (error) {
        console.error('Failed to fetch carriers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCarriers()
  }, [page, verifiedOnly, selectedCountry])

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < fullStars ? 'text-yellow-400' : 'text-slate-600'}>★</span>
      )
    }
    return stars
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Vector<span className="text-cyan-400">Node</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
              Hyr
            </Link>
            <Link href="/register" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors">
              Regjistrohu
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Transportuesit e Verifikuar
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Gjeni transportues të besueshëm për ngarkesën tuaj. Të gjithë transportuesit janë të verifikuar dhe vlerësuar nga klientët.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => { setVerifiedOnly(e.target.checked); setPage(1); }}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              Vetëm të verifikuar
            </label>

            <select
              value={selectedCountry}
              onChange={(e) => { setSelectedCountry(e.target.value); setPage(1); }}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Të gjitha vendet</option>
              <option value="AL">🇦🇱 Shqipëri</option>
              <option value="XK">🇽🇰 Kosovë</option>
              <option value="IT">🇮🇹 Itali</option>
              <option value="GR">🇬🇷 Greqi</option>
              <option value="MK">🇲🇰 Maqedoni</option>
              <option value="ME">🇲🇪 Mali i Zi</option>
            </select>

            <div className="ml-auto text-slate-400">
              {carriers.length} transportues gjetur
            </div>
          </div>
        </div>
      </div>

      {/* Carriers Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : carriers.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-xl mb-4">Nuk u gjet asnjë transportues</p>
            <button
              onClick={() => { setVerifiedOnly(false); setSelectedCountry(''); }}
              className="text-cyan-400 hover:underline"
            >
              Hiq filtrat
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carriers.map((carrier) => (
                <Link
                  key={carrier.id}
                  href={carrier.slug ? `/carriers/${carrier.slug}` : `/carriers/${carrier.id}`}
                  className="bg-slate-800 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-200 overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {carrier.logo ? (
                          <img src={carrier.logo} alt={carrier.companyName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">🚚</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                            {carrier.companyName}
                          </h3>
                          {carrier.verified && (
                            <span className="text-green-400 text-sm">✓</span>
                          )}
                        </div>
                        {(carrier.city || carrier.country) && (
                          <p className="text-slate-400 text-sm truncate">
                            📍 {[carrier.city, carrier.country].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">{renderStars(carrier.rating)}</div>
                      <span className="font-semibold text-white">{carrier.rating.toFixed(1)}</span>
                      <span className="text-slate-400 text-sm">({carrier.totalReviews})</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                        <div className="text-lg font-semibold text-white">{carrier.totalDeliveries}</div>
                        <div className="text-xs text-slate-400">Transportime</div>
                      </div>
                      <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                        <div className="text-lg font-semibold text-white">{carrier.fleetSize}</div>
                        <div className="text-xs text-slate-400">Mjete</div>
                      </div>
                      <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                        <div className="text-lg font-semibold text-green-400">{carrier.onTimeDeliveryRate}%</div>
                        <div className="text-xs text-slate-400">Në kohë</div>
                      </div>
                    </div>

                    {/* Coverage */}
                    <div className="flex flex-wrap gap-1">
                      {carrier.coverageCountries?.slice(0, 4).map((country: string) => (
                        <span key={country} className="text-lg" title={country}>
                          {COUNTRY_FLAGS[country] || country}
                        </span>
                      ))}
                      {carrier.coverageCountries?.length > 4 && (
                        <span className="text-slate-400 text-sm">+{carrier.coverageCountries.length - 4}</span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 bg-slate-700/30 border-t border-slate-700 flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${
                      carrier.verified
                        ? 'bg-green-500/20 text-green-400'
                        : carrier.subscriptionTier === 'FREE_TRIAL'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {carrier.verified ? 'Verified' : carrier.subscriptionTier === 'FREE_TRIAL' ? 'Trial' : 'Unverified'}
                    </span>
                    <span className="text-cyan-400 text-sm group-hover:translate-x-1 transition-transform">
                      Shiko profilin →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                >
                  ← Para
                </button>
                <span className="px-4 py-2 text-slate-400">
                  Faqja {page} nga {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                >
                  Pas →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-t border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Jeni transportues?</h2>
          <p className="text-slate-300 mb-6">Regjistrohuni dhe filloni të merrni ngarkesa nga klientë të besueshëm</p>
          <Link
            href="/register?role=carrier"
            className="inline-block px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
          >
            Regjistrohu si Transportues
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-2xl font-bold text-white">
              Vector<span className="text-cyan-400">Node</span>
            </div>
            <div className="flex gap-6 text-slate-400">
              <Link href="/pricing/carriers" className="hover:text-white transition-colors">Çmimet</Link>
              <Link href="/about" className="hover:text-white transition-colors">Rreth nesh</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Kontakt</Link>
            </div>
            <p className="text-slate-500 text-sm">© 2024 VectorNode</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
