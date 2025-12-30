'use client';

import { useState, useEffect } from 'react';

interface CarrierSubscription {
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionEndsAt?: string;
  trialEndsAt?: string;
  fleetSize: number;
  monthlyBidsUsed: number;
}

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
    color: 'slate',
    badge: null
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
    color: 'cyan'
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
    color: 'cyan',
    popular: true
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
    color: 'cyan',
    badge: 'VERIFIED'
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
  ]
};

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<CarrierSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [vehicleCount, setVehicleCount] = useState(1);
  const [billingMode, setBillingMode] = useState<'subscription' | 'payperwin'>('subscription');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carriers/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.carrier);
        setVehicleCount(data.carrier?.fleetSize || 1);
      }
    } catch (error) {
      void error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeModal(true);
  };

  const processUpgrade = async () => {
    setShowUpgradeModal(false);
    window.location.href = '/carrier/subscription/checkout?plan=' + selectedPlan;
  };

  const getCurrentPlanDetails = () => {
    return plans.find(p => p.id === currentPlan?.subscriptionTier) || plans[0];
  };

  const getTrialDaysLeft = () => {
    if (!currentPlan?.trialEndsAt) return null;
    const now = new Date();
    const end = new Date(currentPlan.trialEndsAt);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getPlanLimits = (tier: string) => {
    return PLAN_LIMITS[tier as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.FREE_TRIAL;
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const currentPlanDetails = getCurrentPlanDetails();
  const trialDaysLeft = getTrialDaysLeft();
  const currentLimits = getPlanLimits(currentPlan?.subscriptionTier || 'FREE_TRIAL');
  const isExpired = currentPlan?.subscriptionStatus === 'expired';
  const isTrialExpired = currentPlan?.subscriptionTier === 'FREE_TRIAL' && trialDaysLeft === 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Subscription & Billing</h1>
          <p className="text-slate-400 mt-1">Manage your fleet subscription</p>
        </div>

        {(isExpired || isTrialExpired) && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-200">
                  {isTrialExpired ? 'Free Trial Expired' : 'Subscription Expired'}
                </p>
                <p className="text-sm text-red-300">
                  Bidding is disabled. Upgrade now to continue winning loads.
                </p>
              </div>
              <button
                onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
                className="ml-auto px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {currentPlan?.subscriptionTier === 'FREE_TRIAL' && trialDaysLeft !== null && trialDaysLeft > 0 && trialDaysLeft <= 7 && (
          <div className="bg-amber-900/50 border border-amber-500 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 font-bold">
                {trialDaysLeft}
              </div>
              <div>
                <p className="font-semibold text-amber-200">Trial Ending Soon</p>
                <p className="text-sm text-amber-300">
                  {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining. Upgrade to avoid service interruption.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                currentPlan?.subscriptionTier === 'LARGE_FLEET' ? 'bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-500' :
                currentPlan?.subscriptionTier === 'MEDIUM_FLEET' ? 'bg-cyan-500/20 text-cyan-400' :
                currentPlan?.subscriptionTier === 'SMALL_FLEET' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-slate-700 text-slate-400'
              }`}>
                {currentPlanDetails.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{currentPlanDetails.name}</h3>
                  {currentPlan?.subscriptionTier === 'LARGE_FLEET' && (
                    <span className="px-2 py-0.5 bg-cyan-500 text-slate-900 text-xs font-bold rounded">VERIFIED</span>
                  )}
                </div>
                <p className="text-slate-400">{currentPlanDetails.description}</p>
                {currentPlan?.subscriptionEndsAt && currentPlan.subscriptionStatus === 'active' && (
                  <p className="text-sm text-slate-500 mt-1">
                    Renews: {new Date(currentPlan.subscriptionEndsAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                currentPlan?.subscriptionStatus === 'active' ? 'bg-green-500/20 text-green-400' :
                currentPlan?.subscriptionStatus === 'trial' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {currentPlan?.subscriptionStatus === 'trial' ? 'TRIAL' :
                 currentPlan?.subscriptionStatus === 'active' ? 'ACTIVE' : 'EXPIRED'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="text-sm text-slate-500">Fleet Size</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-cyan-400">{currentPlan?.fleetSize || 0}</p>
                  <p className="text-slate-500">/ {currentLimits.max} trucks</p>
                </div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (currentPlan?.fleetSize || 0) >= currentLimits.max ? 'bg-red-500' :
                      (currentPlan?.fleetSize || 0) >= currentLimits.max * 0.8 ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(((currentPlan?.fleetSize || 0) / currentLimits.max) * 100, 100)}%` }}
                  />
                </div>
                {(currentPlan?.fleetSize || 0) >= currentLimits.max && (
                  <p className="text-xs text-red-400 mt-2">Fleet limit reached. Upgrade to add more trucks.</p>
                )}
              </div>
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="text-sm text-slate-500">Monthly Cost</p>
                <p className="text-3xl font-bold">
                  {currentPlanDetails.pricePerVehicle > 0
                    ? `€${currentPlanDetails.pricePerVehicle * (currentPlan?.fleetSize || 1)}`
                    : currentPlan?.subscriptionTier === 'FLEX' ? '10% per win' : 'Free'
                  }
                </p>
                {currentPlanDetails.pricePerVehicle > 0 && (
                  <p className="text-sm text-slate-500 mt-1">€{currentPlanDetails.pricePerVehicle}/truck/month</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingMode('subscription')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                billingMode === 'subscription'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Monthly Subscription
            </button>
            <button
              onClick={() => setBillingMode('payperwin')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                billingMode === 'payperwin'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Pay-per-Win
            </button>
          </div>
        </div>

        {billingMode === 'subscription' && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold mb-4">How many trucks in your fleet?</h3>
            <div className="flex items-center gap-6">
              <input
                type="range"
                min="1"
                max="200"
                value={vehicleCount}
                onChange={(e) => setVehicleCount(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="w-24 text-center">
                <span className="text-4xl font-bold text-cyan-400">{vehicleCount}</span>
                <p className="text-xs text-slate-500">trucks</p>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>1</span>
              <span>20</span>
              <span>49</span>
              <span>200 (MAX)</span>
            </div>
            <div className="mt-4 p-3 bg-slate-900 rounded-lg">
              <p className="text-sm text-slate-400">
                Recommended plan: <span className="text-cyan-400 font-semibold">
                  {plans.find(p => p.id === getRequiredPlan(vehicleCount))?.name}
                </span>
              </p>
            </div>
          </div>
        )}

        <div id="plans">
          <h2 className="text-xl font-semibold mb-4">Available Plans</h2>

          {billingMode === 'payperwin' ? (
            <div className="max-w-lg mx-auto">
              <div className="bg-slate-800 rounded-xl border-2 border-cyan-500 overflow-hidden">
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold">Flex10 (Pay-per-Win)</h3>
                  <p className="text-slate-400 mt-2">{flexPlan.description}</p>

                  <div className="mt-6">
                    <span className="text-5xl font-bold">€0</span>
                    <span className="text-slate-400"> monthly</span>
                    <p className="text-xl text-cyan-400 mt-2">+ 10% commission on wins</p>
                  </div>

                  <ul className="mt-8 space-y-3 text-left">
                    {flexPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                    {flexPlan.limitations.map((limitation, index) => (
                      <li key={`lim-${index}`} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-slate-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade('FLEX')}
                    className="mt-8 w-full py-3 bg-cyan-500 text-slate-900 rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
                  >
                    Activate Flex10
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map(plan => {
                const isCurrentPlan = currentPlan?.subscriptionTier === plan.id;
                const isRecommended = getRequiredPlan(vehicleCount) === plan.id;
                const monthlyTotal = calculateMonthlyTotal(plan, vehicleCount);
                const canDowngrade = plans.findIndex(p => p.id === plan.id) < plans.findIndex(p => p.id === currentPlan?.subscriptionTier);

                return (
                  <div
                    key={plan.id}
                    className={`bg-slate-800 rounded-xl overflow-hidden relative transition-all ${
                      plan.popular ? 'ring-2 ring-cyan-500' : 'border border-slate-700'
                    } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                  >
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute top-0 left-0 right-0 bg-cyan-500 text-slate-900 text-center py-1 text-xs font-bold">
                        MOST POPULAR
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute top-0 left-0 right-0 bg-green-500 text-slate-900 text-center py-1 text-xs font-bold">
                        CURRENT PLAN
                      </div>
                    )}

                    <div className={`p-6 ${plan.popular || isCurrentPlan ? 'pt-10' : ''}`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">{plan.name}</h3>
                        {plan.badge && (
                          <span className="px-2 py-0.5 bg-cyan-500 text-slate-900 text-xs font-bold rounded">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{plan.description}</p>

                      <div className="mt-4">
                        {plan.pricePerVehicle === 0 ? (
                          <span className="text-3xl font-bold">Free</span>
                        ) : (
                          <>
                            <span className="text-3xl font-bold">€{plan.pricePerVehicle}</span>
                            <span className="text-slate-400">/truck/mo</span>
                          </>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 mt-1">
                        {plan.minVehicles}-{plan.maxVehicles} trucks
                      </p>

                      {isRecommended && !isCurrentPlan && plan.pricePerVehicle > 0 && (
                        <div className="mt-3 p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                          <p className="text-sm font-semibold text-cyan-400">
                            €{monthlyTotal}/month for {vehicleCount} trucks
                          </p>
                        </div>
                      )}

                      <ul className="mt-4 space-y-2">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <svg className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-slate-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6 pt-0">
                      {isCurrentPlan ? (
                        <button
                          disabled
                          className="w-full py-2.5 bg-slate-700 text-slate-500 rounded-lg font-medium cursor-not-allowed"
                        >
                          Current Plan
                        </button>
                      ) : canDowngrade ? (
                        <button
                          disabled
                          className="w-full py-2.5 bg-slate-700 text-slate-500 rounded-lg font-medium cursor-not-allowed"
                        >
                          Downgrade
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpgrade(plan.id)}
                          className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                            isRecommended
                              ? 'bg-cyan-500 text-slate-900 hover:bg-cyan-400'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {plan.id === 'FREE_TRIAL' ? 'Start Trial' : 'Upgrade'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-amber-500/30">
          <h3 className="font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Important Rules
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• <strong>Maximum 200 trucks</strong> per company (hard limit)</li>
            <li>• Truck #21 requires <strong>Medium Fleet</strong> plan</li>
            <li>• Truck #50 requires <strong>Large Fleet</strong> plan</li>
            <li>• Expired subscription = <strong>Bidding disabled</strong></li>
            <li>• Upgrade anytime, downgrade at cycle end</li>
          </ul>
        </div>

        {showUpgradeModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {selectedPlan === 'FLEX' ? 'Activate Flex10' : 'Upgrade Plan'}
                  </h2>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-slate-400">
                    Upgrading to{' '}
                    <span className="font-bold text-white">
                      {selectedPlan === 'FLEX' ? 'Flex10' : plans.find(p => p.id === selectedPlan)?.name}
                    </span>
                  </p>
                  {selectedPlan === 'FLEX' ? (
                    <p className="text-3xl font-bold mt-2">€0 + 10% per win</p>
                  ) : (
                    <p className="text-3xl font-bold mt-2">
                      €{calculateMonthlyTotal(plans.find(p => p.id === selectedPlan)!, vehicleCount)}/month
                    </p>
                  )}
                </div>

                <button
                  onClick={processUpgrade}
                  className="w-full py-3 bg-cyan-500 text-slate-900 rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
                >
                  Proceed to Payment
                </button>
                <p className="text-xs text-slate-500 text-center mt-3">
                  Cancel anytime. Billing starts immediately.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
