'use client';

import { useState } from 'react';
import Link from 'next/link';

const PLAN_LIMITS = {
  FREE_TRIAL: { min: 1, max: 2 },
  SMALL_FLEET: { min: 1, max: 20 },
  MEDIUM_FLEET: { min: 21, max: 49 },
  LARGE_FLEET: { min: 50, max: 200 },
  FLEX: { min: 1, max: 200 }
};

const plans = [
  {
    id: 'FREE_TRIAL',
    name: 'Free Trial',
    pricePerVehicle: 0,
    period: '30 days',
    description: 'Test the platform risk-free',
    minVehicles: 1,
    maxVehicles: 2,
    features: [
      '30 days free access',
      'Up to 2 trucks',
      'Browse all loads',
      'Submit offers',
      'Win contracts'
    ],
    limitations: [
      'No priority listing',
      'No verified badge',
      'Bidding disabled after trial'
    ],
    cta: 'Start Free Trial'
  },
  {
    id: 'SMALL_FLEET',
    name: 'Small Fleet',
    pricePerVehicle: 69,
    period: 'month',
    description: 'For growing carriers',
    minVehicles: 1,
    maxVehicles: 20,
    features: [
      'Unlimited offers',
      'Win unlimited contracts',
      'Fleet management',
      'Driver management',
      '1-20 trucks'
    ],
    limitations: [
      'No priority listing',
      'No verified badge'
    ],
    cta: 'Choose Small Fleet'
  },
  {
    id: 'MEDIUM_FLEET',
    name: 'Medium Fleet',
    pricePerVehicle: 59,
    period: 'month',
    description: 'For established carriers',
    minVehicles: 21,
    maxVehicles: 49,
    features: [
      'Everything in Small Fleet',
      'Public carrier profile',
      'Monthly analytics',
      'Normal priority in listings',
      '21-49 trucks'
    ],
    limitations: [],
    popular: true,
    cta: 'Choose Medium Fleet'
  },
  {
    id: 'LARGE_FLEET',
    name: 'Large Fleet',
    pricePerVehicle: 49,
    period: 'month',
    description: 'For enterprise operations',
    minVehicles: 50,
    maxVehicles: 200,
    features: [
      'Everything in Medium Fleet',
      'High priority in listings',
      'Verified Fleet badge',
      'Priority support',
      'Early access to new loads',
      'Advanced analytics',
      '50-200 trucks (MAX)'
    ],
    limitations: [],
    badge: 'VERIFIED',
    cta: 'Choose Large Fleet'
  }
];

const flexPlan = {
  id: 'FLEX',
  name: 'Flex10 (Pay-per-Win)',
  description: 'Pay only when you win',
  features: [
    '€0 monthly fee',
    '10% commission on won loads only',
    'Ideal for occasional carriers',
    'Up to 200 trucks'
  ],
  limitations: [
    'No priority listing',
    'No verified badge',
    'Ranked below subscribed carriers'
  ],
  cta: 'Activate Flex10'
};

export default function CarrierPricingPage() {
  const [vehicleCount, setVehicleCount] = useState(10);
  const [billingMode, setBillingMode] = useState<'subscription' | 'payperwin'>('subscription');

  const getRequiredPlan = (truckCount: number) => {
    if (truckCount <= 2) return 'FREE_TRIAL';
    if (truckCount <= 20) return 'SMALL_FLEET';
    if (truckCount <= 49) return 'MEDIUM_FLEET';
    if (truckCount <= 200) return 'LARGE_FLEET';
    return null;
  };

  const calculateMonthlyTotal = (plan: typeof plans[0], trucks: number) => {
    const effectiveTrucks = Math.min(Math.max(trucks, plan.minVehicles), plan.maxVehicles);
    return plan.pricePerVehicle * effectiveTrucks;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-cyan-400">VectorNode</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-slate-300 hover:text-white px-3 py-2 font-medium">
                Sign In
              </Link>
              <Link href="/register?role=CARRIER" className="bg-cyan-500 text-slate-900 hover:bg-cyan-400 px-4 py-2 rounded-lg font-medium transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Carrier Subscription Plans
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-4">
            Scale your fleet with transparent pricing. Pay per truck, grow at your pace.
          </p>
          <p className="text-lg text-cyan-400 font-medium">
            Maximum 200 trucks per company
          </p>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingMode('subscription')}
              className={`px-8 py-4 rounded-xl font-medium text-lg transition-all ${
                billingMode === 'subscription'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Monthly Subscription
            </button>
            <button
              onClick={() => setBillingMode('payperwin')}
              className={`px-8 py-4 rounded-xl font-medium text-lg transition-all ${
                billingMode === 'payperwin'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Pay-per-Win
            </button>
          </div>
        </div>
      </section>

      {billingMode === 'subscription' && (
        <section className="py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-xl font-semibold mb-6 text-center">
                How many trucks in your fleet?
              </h3>
              <div className="flex items-center gap-8">
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={vehicleCount}
                  onChange={(e) => setVehicleCount(parseInt(e.target.value))}
                  className="flex-1 h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="w-28 text-center">
                  <span className="text-5xl font-bold text-cyan-400">{vehicleCount}</span>
                  <p className="text-sm text-slate-500">trucks</p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-slate-500 mt-4">
                <span>1</span>
                <span>20</span>
                <span>49</span>
                <span>200 (MAX)</span>
              </div>
              <div className="mt-6 p-4 bg-slate-900 rounded-lg text-center">
                <p className="text-slate-400">
                  Recommended plan:{' '}
                  <span className="text-cyan-400 font-bold text-lg">
                    {plans.find(p => p.id === getRequiredPlan(vehicleCount))?.name}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {billingMode === 'payperwin' ? (
            <div className="max-w-xl mx-auto">
              <div className="bg-slate-800 rounded-2xl border-2 border-cyan-500 overflow-hidden">
                <div className="p-10 text-center">
                  <h3 className="text-3xl font-bold">{flexPlan.name}</h3>
                  <p className="text-slate-400 mt-2 text-lg">{flexPlan.description}</p>

                  <div className="mt-8">
                    <span className="text-6xl font-bold">€0</span>
                    <span className="text-xl text-slate-400"> monthly fee</span>
                    <p className="text-2xl text-cyan-400 mt-4 font-semibold">
                      + 10% commission on won loads
                    </p>
                  </div>

                  <ul className="mt-10 space-y-4 text-left max-w-sm mx-auto">
                    {flexPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-lg">
                        <svg className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                    {flexPlan.limitations.map((limitation, index) => (
                      <li key={`lim-${index}`} className="flex items-start gap-3 text-lg">
                        <svg className="w-6 h-6 text-slate-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-slate-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register?role=CARRIER&plan=FLEX"
                    className="mt-10 block w-full py-4 bg-cyan-500 text-slate-900 rounded-xl font-semibold text-lg hover:bg-cyan-400 transition-colors"
                  >
                    {flexPlan.cta}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map(plan => {
                const isRecommended = getRequiredPlan(vehicleCount) === plan.id;
                const monthlyTotal = calculateMonthlyTotal(plan, vehicleCount);

                return (
                  <div
                    key={plan.id}
                    className={`bg-slate-800 rounded-2xl overflow-hidden relative transition-all hover:scale-[1.02] ${
                      plan.popular ? 'ring-2 ring-cyan-500' : 'border border-slate-700'
                    } ${isRecommended && !plan.popular ? 'ring-2 ring-cyan-400' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-0 right-0 bg-cyan-500 text-slate-900 text-center py-2 text-sm font-bold">
                        MOST POPULAR
                      </div>
                    )}
                    {isRecommended && !plan.popular && (
                      <div className="absolute top-0 left-0 right-0 bg-cyan-400 text-slate-900 text-center py-2 text-sm font-bold">
                        RECOMMENDED FOR YOU
                      </div>
                    )}

                    <div className={`p-8 ${plan.popular || isRecommended ? 'pt-14' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        {plan.badge && (
                          <span className="px-2 py-1 bg-cyan-500 text-slate-900 text-xs font-bold rounded">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400">{plan.description}</p>

                      <div className="mt-6">
                        {plan.pricePerVehicle === 0 ? (
                          <div>
                            <span className="text-4xl font-bold">Free</span>
                            <p className="text-sm text-slate-500 mt-1">for 30 days</p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-4xl font-bold">€{plan.pricePerVehicle}</span>
                            <span className="text-slate-400">/truck/month</span>
                            {isRecommended && (
                              <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                                <p className="text-lg font-bold text-cyan-400">
                                  €{monthlyTotal}/month
                                </p>
                                <p className="text-sm text-cyan-300">
                                  for {vehicleCount} trucks
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 mt-4 mb-6">
                        {plan.minVehicles}-{plan.maxVehicles} trucks
                      </p>

                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-slate-300">{feature}</span>
                          </li>
                        ))}
                        {plan.limitations.map((limitation, index) => (
                          <li key={`lim-${index}`} className="flex items-start gap-2 text-sm">
                            <svg className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="text-slate-500">{limitation}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={`/register?role=CARRIER&plan=${plan.id}`}
                        className={`block w-full py-3 rounded-xl font-semibold text-center transition-colors ${
                          isRecommended || plan.popular
                            ? 'bg-cyan-500 text-slate-900 hover:bg-cyan-400'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Plan Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-700">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-400">Free Trial</th>
                  <th className="text-center py-4 px-4 font-semibold text-cyan-400">Small</th>
                  <th className="text-center py-4 px-4 font-semibold text-cyan-400">Medium</th>
                  <th className="text-center py-4 px-4 font-semibold text-cyan-400">Large</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-400">Flex10</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-4 px-4 text-slate-300">Price per truck</td>
                  <td className="text-center py-4 px-4">Free</td>
                  <td className="text-center py-4 px-4 font-semibold">€69/mo</td>
                  <td className="text-center py-4 px-4 font-semibold">€59/mo</td>
                  <td className="text-center py-4 px-4 font-semibold">€49/mo</td>
                  <td className="text-center py-4 px-4">€0 + 10%</td>
                </tr>
                <tr className="bg-slate-800/50">
                  <td className="py-4 px-4 text-slate-300">Fleet size</td>
                  <td className="text-center py-4 px-4">1-2</td>
                  <td className="text-center py-4 px-4">1-20</td>
                  <td className="text-center py-4 px-4">21-49</td>
                  <td className="text-center py-4 px-4">50-200</td>
                  <td className="text-center py-4 px-4">1-200</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300">Unlimited offers</td>
                  <td className="text-center py-4 px-4 text-cyan-400">✓</td>
                  <td className="text-center py-4 px-4 text-cyan-400">✓</td>
                  <td className="text-center py-4 px-4 text-cyan-400">✓</td>
                  <td className="text-center py-4 px-4 text-cyan-400">✓</td>
                  <td className="text-center py-4 px-4 text-cyan-400">✓</td>
                </tr>
                <tr className="bg-slate-800/50">
                  <td className="py-4 px-4 text-slate-300">Public profile</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                  <td className="text-center py-4 px-4 text-cyan-400">✓</td>
                  <td className="text-center py-4 px-4 text-cyan-400">✓</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300">Priority listing</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                  <td className="text-center py-4 px-4 text-slate-400">Normal</td>
                  <td className="text-center py-4 px-4 text-cyan-400">High</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                </tr>
                <tr className="bg-slate-800/50">
                  <td className="py-4 px-4 text-slate-300">Verified badge</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                  <td className="text-center py-4 px-4 text-cyan-400">✓</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300">Analytics</td>
                  <td className="text-center py-4 px-4 text-slate-600">Basic</td>
                  <td className="text-center py-4 px-4 text-slate-400">Basic</td>
                  <td className="text-center py-4 px-4 text-cyan-400">Monthly</td>
                  <td className="text-center py-4 px-4 text-cyan-400">Advanced</td>
                  <td className="text-center py-4 px-4 text-slate-600">Basic</td>
                </tr>
                <tr className="bg-slate-800/50">
                  <td className="py-4 px-4 text-slate-300">Support</td>
                  <td className="text-center py-4 px-4 text-slate-400">Email</td>
                  <td className="text-center py-4 px-4 text-slate-400">Email</td>
                  <td className="text-center py-4 px-4 text-slate-400">Email + Chat</td>
                  <td className="text-center py-4 px-4 text-cyan-400">Priority</td>
                  <td className="text-center py-4 px-4 text-slate-400">Email</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300">Early access to loads</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                  <td className="text-center py-4 px-4 text-cyan-400">✓</td>
                  <td className="text-center py-4 px-4 text-slate-600">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800 rounded-2xl p-8 border border-amber-500/30">
            <h3 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Important Rules
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 font-bold">200</span>
                  </div>
                  <div>
                    <p className="font-semibold">Maximum Fleet Size</p>
                    <p className="text-slate-400 text-sm">Hard limit of 200 trucks per company</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 font-bold">21</span>
                  </div>
                  <div>
                    <p className="font-semibold">Medium Fleet Required</p>
                    <p className="text-slate-400 text-sm">Truck #21 requires Medium Fleet plan</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 font-bold">50</span>
                  </div>
                  <div>
                    <p className="font-semibold">Large Fleet Required</p>
                    <p className="text-slate-400 text-sm">Truck #50 requires Large Fleet plan</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Expired = No Bidding</p>
                    <p className="text-slate-400 text-sm">Bidding disabled when subscription expires</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h4 className="font-semibold text-lg mb-2">What happens after the free trial?</h4>
              <p className="text-slate-400">
                After 30 days, bidding is disabled until you choose a paid plan or Flex10.
                Your account and data remain accessible.
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h4 className="font-semibold text-lg mb-2">How does Flex10 work?</h4>
              <p className="text-slate-400">
                No monthly fee. We charge 10% commission only when you win a load.
                Ideal for occasional carriers or testing the market.
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h4 className="font-semibold text-lg mb-2">Can I upgrade mid-month?</h4>
              <p className="text-slate-400">
                Yes, upgrades are immediate. You only pay the prorated difference.
                Downgrades take effect at the end of your billing cycle.
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h4 className="font-semibold text-lg mb-2">Why is there a 200 truck limit?</h4>
              <p className="text-slate-400">
                To ensure fair competition and prevent market monopolization.
                For larger operations, contact us for enterprise solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to grow your fleet?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Start with a free 30-day trial. No credit card required.
          </p>
          <Link
            href="/register?role=CARRIER"
            className="inline-block px-10 py-5 bg-cyan-500 text-slate-900 rounded-xl font-bold text-lg hover:bg-cyan-400 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-2xl font-bold text-cyan-400">VectorNode</span>
              <p className="text-slate-500 mt-2">European Logistics Marketplace</p>
            </div>
            <div className="flex space-x-8">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
              <Link href="/pricing/carriers" className="text-slate-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="/login" className="text-slate-400 hover:text-white transition-colors">Sign In</Link>
              <Link href="/register" className="text-slate-400 hover:text-white transition-colors">Register</Link>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500">
            <p>© 2025 VectorNode. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
