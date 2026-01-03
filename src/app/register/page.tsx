'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vector-node-backend.onrender.com/api'

// Transport types for carriers
const TRANSPORT_TYPES = [
  { key: 'PARCELS', label: 'Colli / Pacchi', icon: '📦' },
  { key: 'PALLETS', label: 'Pallets / Bancali', icon: '🧱' },
  { key: 'VEHICLES', label: 'Veicoli / Auto', icon: '🚗' },
  { key: 'REFRIGERATED', label: 'Refrigerato / Frigo', icon: '❄️' },
  { key: 'HAZMAT', label: 'ADR / Pericoloso', icon: '☣️' },
  { key: 'ANIMALS', label: 'Animali Vivi', icon: '🐄' },
  { key: 'BULK', label: 'Rinfusa / Sfuso', icon: '🌾' },
  { key: 'OVERSIZED', label: 'Fuori Sagoma', icon: '📐' }
] as const

// Italian translations
const TRANSLATIONS = {
  title: 'VectorNode',
  subtitle: 'Crea il tuo account',
  selectRole: 'Tipo di Account',
  roles: {
    SHIPPER: 'Mittente',
    CARRIER: 'Trasportatore',
    WAREHOUSE: 'Magazzino'
  },
  shipperType: 'Tipo di Mittente',
  shipperTypes: {
    PRIVATE: 'Privato',
    COMPANY: 'Azienda'
  },
  // Transport types
  transportTypesLabel: 'Che tipo di trasporto effettui?',
  transportTypesRequired: 'Seleziona almeno un tipo di trasporto',
  transportTypesHint: 'Riceverai solo carichi compatibili con i tuoi servizi',
  // Form labels
  firstName: 'Nome',
  lastName: 'Cognome',
  email: 'Email',
  phone: 'Telefono (opzionale)',
  password: 'Password (min 8 caratteri, maiuscola, minuscola, numero)',
  confirmPassword: 'Conferma Password',
  companyName: 'Ragione Sociale',
  vatNumber: 'Partita IVA',
  // Buttons
  createAccount: 'Crea Account',
  creating: 'Creazione in corso...',
  // Links
  alreadyHaveAccount: 'Hai già un account?',
  signIn: 'Accedi',
  // Errors
  passwordMismatch: 'Le password non corrispondono',
  passwordTooShort: 'La password deve essere di almeno 8 caratteri',
  passwordRequirements: 'La password deve contenere maiuscola, minuscola e numero',
  registrationFailed: 'Registrazione fallita',
  loading: 'Caricamento...',
  // ID Document notice
  idNotice: 'Per i privati: dopo la registrazione dovrai caricare un documento d\'identità per poter creare spedizioni.',
  companyNotice: 'Per le aziende: inserisci la Partita IVA per l\'attivazione immediata.'
}

export default function RegisterPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'SHIPPER' as 'SHIPPER' | 'CARRIER' | 'WAREHOUSE',
    // Shipper-specific fields
    shipperType: 'PRIVATE' as 'PRIVATE' | 'COMPANY',
    companyName: '',
    vatNumber: '',
    // Carrier-specific fields
    transportTypes: [] as string[]
  })

  // Toggle transport type selection
  const toggleTransportType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      transportTypes: prev.transportTypes.includes(type)
        ? prev.transportTypes.filter(t => t !== type)
        : [...prev.transportTypes, type]
    }))
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError(TRANSLATIONS.passwordMismatch)
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError(TRANSLATIONS.passwordTooShort)
      setLoading(false)
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    if (!passwordRegex.test(formData.password)) {
      setError(TRANSLATIONS.passwordRequirements)
      setLoading(false)
      return
    }

    // Validate carrier transport types
    if (formData.role === 'CARRIER' && formData.transportTypes.length === 0) {
      setError(TRANSLATIONS.transportTypesRequired)
      setLoading(false)
      return
    }

    try {
      console.log('[REGISTER] Sending POST to:', `${API_URL}/auth/register`)
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          // Shipper-specific
          shipperType: formData.role === 'SHIPPER' ? formData.shipperType : undefined,
          companyName: formData.role === 'SHIPPER' && formData.shipperType === 'COMPANY' ? formData.companyName : undefined,
          vatNumber: formData.role === 'SHIPPER' && formData.shipperType === 'COMPANY' ? formData.vatNumber : undefined,
          // Carrier-specific
          transportTypes: formData.role === 'CARRIER' ? formData.transportTypes : undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || TRANSLATIONS.registrationFailed)
      }

      // Save token and user to localStorage
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      router.push(`/${formData.role.toLowerCase()}`)

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : TRANSLATIONS.registrationFailed
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-gray-500">{TRANSLATIONS.loading}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{TRANSLATIONS.title}</h2>
          <p className="mt-2 text-sm text-gray-600">{TRANSLATIONS.subtitle}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{TRANSLATIONS.selectRole}</label>
            <div className="grid grid-cols-3 gap-2">
              {(['SHIPPER', 'CARRIER', 'WAREHOUSE'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    formData.role === role
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {TRANSLATIONS.roles[role]}
                </button>
              ))}
            </div>
          </div>

          {/* Transport Type Selection (only for CARRIER) */}
          {formData.role === 'CARRIER' && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {TRANSLATIONS.transportTypesLabel}
                </label>
                <p className="text-xs text-gray-500 mb-3">{TRANSLATIONS.transportTypesHint}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TRANSPORT_TYPES.map((type) => {
                  const isSelected = formData.transportTypes.includes(type.key)
                  return (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => toggleTransportType(type.key)}
                      className={`py-3 px-3 rounded-lg text-sm font-medium transition-all border-2 flex items-center gap-2 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-100 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-xs">{type.label}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
              {formData.transportTypes.length > 0 && (
                <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                  Selezionati: {formData.transportTypes.length} tipi di trasporto
                </div>
              )}
            </div>
          )}

          {/* Shipper Type Selection (only for SHIPPER) */}
          {formData.role === 'SHIPPER' && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <label className="block text-sm font-medium text-gray-700">{TRANSLATIONS.shipperType}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, shipperType: 'PRIVATE' })}
                  className={`py-3 px-4 rounded-lg text-sm font-medium transition-all border-2 ${
                    formData.shipperType === 'PRIVATE'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {TRANSLATIONS.shipperTypes.PRIVATE}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, shipperType: 'COMPANY' })}
                  className={`py-3 px-4 rounded-lg text-sm font-medium transition-all border-2 ${
                    formData.shipperType === 'COMPANY'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {TRANSLATIONS.shipperTypes.COMPANY}
                  </div>
                </button>
              </div>

              {/* Notice based on type */}
              <div className={`text-xs p-3 rounded-lg ${
                formData.shipperType === 'PRIVATE'
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}>
                {formData.shipperType === 'PRIVATE' ? TRANSLATIONS.idNotice : TRANSLATIONS.companyNotice}
              </div>

              {/* Company-specific fields */}
              {formData.shipperType === 'COMPANY' && (
                <div className="space-y-3 pt-2">
                  <input
                    required
                    type="text"
                    placeholder={TRANSLATIONS.companyName}
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    required
                    type="text"
                    placeholder={TRANSLATIONS.vatNumber}
                    value={formData.vatNumber}
                    onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder={TRANSLATIONS.firstName}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              required
              type="text"
              placeholder={TRANSLATIONS.lastName}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <input
            required
            type="email"
            placeholder={TRANSLATIONS.email}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="tel"
            placeholder={TRANSLATIONS.phone}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            required
            type="password"
            placeholder={TRANSLATIONS.password}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            required
            type="password"
            placeholder={TRANSLATIONS.confirmPassword}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {loading ? TRANSLATIONS.creating : TRANSLATIONS.createAccount}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {TRANSLATIONS.alreadyHaveAccount}{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            {TRANSLATIONS.signIn}
          </Link>
        </p>
      </div>
    </div>
  )
}
