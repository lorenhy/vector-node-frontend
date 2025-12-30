'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Load types for the form
const LOAD_TYPES = [
  { value: 'GENERAL', label: 'General Cargo' },
  { value: 'PALLETS', label: 'Pallets' },
  { value: 'CONTAINER', label: 'Container' },
  { value: 'REFRIGERATED', label: 'Refrigerated' },
  { value: 'FRAGILE', label: 'Fragile' },
  { value: 'HAZMAT', label: 'Hazardous' },
  { value: 'HEAVY', label: 'Heavy Machinery' },
  { value: 'VEHICLE', label: 'Vehicle' },
]

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Quote form state
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [loadType, setLoadType] = useState('')
  const [pickupDate, setPickupDate] = useState('')

  useEffect(() => {
    setMounted(true)
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
        console.error('Error parsing user:', e)
      }
    }
  }, [])

  const handleGetOffers = () => {
    if (user) {
      // User logged in - go to create shipment
      router.push('/shipper/shipments/new')
    } else {
      // Not logged in - redirect to register with message
      router.push('/register?role=SHIPPER&action=post')
    }
  }

  const handleDashboard = () => {
    if (user?.role) {
      router.push(`/${user.role.toLowerCase()}`)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">VectorNode</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                How It Works
              </a>
              <a href="#trust" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                Why VectorNode
              </a>
              <Link href="/carriers" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                Find Carriers
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-slate-400 text-sm hidden sm:block">
                    {user.firstName || user.email}
                  </span>
                  <button
                    onClick={handleDashboard}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium rounded-lg text-sm transition-colors"
                  >
                    Dashboard
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium rounded-lg text-sm transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            European Freight, Backed by
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Smart Matching + AI Protection</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Get recommended carriers instantly, track with QR proof at every checkpoint,
            and let AI determine liability if anything goes wrong.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#quote"
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg text-lg transition-colors shadow-lg hover:shadow-cyan-500/50"
            >
              Post a Load
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-lg border border-slate-700 transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-semibold text-white mb-2">Smart Matching</h3>
              <p className="text-sm text-slate-400">
                We analyze 50+ factors to recommend the best carrier for your shipment.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
              <div className="text-4xl mb-3">📸</div>
              <h3 className="font-semibold text-white mb-2">Photo Proof Tracking</h3>
              <p className="text-sm text-slate-400">
                QR scans + mandatory photos at every checkpoint. Complete visibility.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-sm border border-cyan-500/50 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
              <div className="text-4xl mb-3">⚖️</div>
              <h3 className="font-semibold text-white mb-2">Automated Liability Detection</h3>
              <p className="text-sm text-slate-300">
                <strong className="text-cyan-400">Our AI analyzes evidence and determines responsibility automatically.</strong> No he-said-she-said.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Panel - Quote Form */}
      <section id="quote" className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">Get offers for your shipment</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Origin */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">From</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Origin city"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">To</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Destination city"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Load Type */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Load Type</label>
                <select
                  value={loadType}
                  onChange={(e) => setLoadType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Select type</option>
                  {LOAD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Pickup Date */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleGetOffers}
                className="px-12 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-lg text-lg transition-colors flex items-center gap-2"
              >
                <span>Get Offers</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            {!user && (
              <p className="mt-4 text-center text-sm text-slate-500">
                Create a free account to receive offers from verified carriers
              </p>
            )}
          </div>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">How It Works</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            Ship anything, anywhere in Europe. Four simple steps.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-cyan-400 font-bold text-sm mb-2">STEP 1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Post Load</h3>
              <p className="text-slate-400 text-sm">
                Describe your shipment, set pickup and delivery locations
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-cyan-400 font-bold text-sm mb-2">STEP 2</div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Smart Recommendations</h3>
              <p className="text-slate-400 text-sm">
                Our matching engine analyzes bids and recommends the best carriers
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-cyan-400 font-bold text-sm mb-2">STEP 3</div>
              <h3 className="text-lg font-semibold text-white mb-2">Assign Carrier</h3>
              <p className="text-slate-400 text-sm">
                Compare offers, check ratings, and select the best carrier
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <div className="text-cyan-400 font-bold text-sm mb-2">STEP 4</div>
              <h3 className="text-lg font-semibold text-white mb-2">Track & Confirm</h3>
              <p className="text-slate-400 text-sm">
                QR tracking at every checkpoint with photo proof of delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Protection Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-cyan-900/10 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-semibold mb-4">
              UNIQUE TO VECTORNODE
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Automated Liability Detection
            </h2>
            <p className="text-lg text-slate-300">
              If damage occurs, our AI analyzes all evidence and determines responsibility automatically.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">QR Code + Photo at Every Checkpoint</h3>
                  <p className="text-slate-400 text-sm">
                    Pickup → Warehouse IN → Warehouse OUT → Delivery. Every scan requires photo proof.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">AI Compares Photos Chronologically</h3>
                  <p className="text-slate-400 text-sm">
                    Our engine analyzes all checkpoint photos to identify exactly where damage appeared.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400 font-bold">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Responsibility Determined in 60 Seconds</h3>
                  <p className="text-slate-400 text-sm">
                    Get an evidence-backed liability report with 85-95% confidence. No endless emails. No guesswork.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-green-300 font-medium">In 94% of disputes, liability is clear within 48 hours.</p>
                  <p className="text-green-400/70 text-sm mt-1">Traditional dispute resolution takes 7-14 days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Verification */}
      <section id="trust" className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Complete Protection, Every Step</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            Enterprise-grade security and transparency for every shipment
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* Verified Carriers */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">Verified Carriers</span>
            </div>

            {/* QR Tracking */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">QR Tracking</span>
            </div>

            {/* Proof of Delivery */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">Photo POD</span>
            </div>

            {/* Digital Signature */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">Digital Signature</span>
            </div>

            {/* Dispute Handling */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">Dispute Handling</span>
            </div>

            {/* EU Compliant */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">EU Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Snapshot - Client Only */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What you get as a shipper</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Transparent Pricing */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Transparent Pricing</h3>
              <p className="text-slate-400 text-sm">Compare bids side-by-side. No hidden fees.</p>
            </div>

            {/* Carrier Ratings */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Carrier Ratings</h3>
              <p className="text-slate-400 text-sm">Real reviews from verified shippers.</p>
            </div>

            {/* Warehouse Tracking */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Warehouse Stops</h3>
              <p className="text-slate-400 text-sm">Track IN/OUT at every warehouse.</p>
            </div>

            {/* Damage Reporting */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Damage Reporting</h3>
              <p className="text-slate-400 text-sm">Photo evidence at every scan point.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Demo / Preview */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Track every step of your shipment</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            Real-time visibility from pickup to delivery
          </p>

          {/* Mock Timeline */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-slate-400 text-sm">Shipment #VN-2025-0127</p>
                <p className="text-white font-semibold">Milano, IT → Munich, DE</p>
              </div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
                In Transit
              </span>
            </div>

            {/* Timeline Steps */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700"></div>

              {/* Step 1 - Completed */}
              <div className="relative flex items-start mb-8 pl-12">
                <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Pickup Completed</span>
                    <span className="text-slate-500 text-sm">• Milano Warehouse</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">Dec 27, 2025 • 08:30</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">QR Scan</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Photo</span>
                  </div>
                </div>
              </div>

              {/* Step 2 - Completed */}
              <div className="relative flex items-start mb-8 pl-12">
                <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Warehouse IN</span>
                    <span className="text-slate-500 text-sm">• Brennero Hub</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">Dec 27, 2025 • 14:45</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">QR Scan</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Photo</span>
                  </div>
                </div>
              </div>

              {/* Step 3 - Current */}
              <div className="relative flex items-start mb-8 pl-12">
                <div className="absolute left-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">In Transit</span>
                    <span className="text-slate-500 text-sm">• A22 Highway</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">ETA: Dec 27, 2025 • 18:00</p>
                </div>
              </div>

              {/* Step 4 - Pending */}
              <div className="relative flex items-start pl-12">
                <div className="absolute left-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Delivery</span>
                    <span className="text-slate-600 text-sm">• Munich Distribution Center</span>
                  </div>
                  <p className="text-slate-600 text-sm mt-1">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start shipping today
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join hundreds of businesses shipping across Europe with verified carriers.
          </p>
          <Link
            href="/register?role=SHIPPER"
            className="inline-flex items-center gap-2 px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-lg text-lg transition-colors"
          >
            <span>Post a Load — it&apos;s free</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-white font-bold">VectorNode</span>
              </div>
              <p className="text-slate-500 text-sm">
                European logistics marketplace for verified carriers and shippers.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</a></li>
                <li><Link href="/carriers" className="text-slate-400 hover:text-white transition-colors">Find Carriers</Link></li>
                <li><Link href="/pricing/carriers" className="text-slate-400 hover:text-white transition-colors">Carrier Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">
              © 2025 VectorNode. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="text-slate-500 text-sm">Made in Europe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
