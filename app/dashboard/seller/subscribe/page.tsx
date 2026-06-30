'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function Subscribe() {
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free_trial')

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('seller_id', user.id)
          .maybeSingle()
        if (data) {
          setSubscription(data)
          setCurrentPlan(data.plan)
        }
      }
    }
    fetchSubscription()
  }, [])

  const plans = [
    {
      id: 'basic_5',
      name: 'Basic',
      price: '$5',
      period: '/month',
      products: 15,
      features: [
        'List up to 15 products',
        'Social media sharing',
        'Basic analytics',
        'Email support'
      ],
      limitations: [
        'Limited to 15 products',
        'No AI automation',
        'Manual product updates'
      ],
      popular: false
    },
    {
      id: 'pro_10',
      name: 'Pro',
      price: '$10',
      period: '/month',
      products: 35,
      features: [
        'List up to 35 products',
        'Social media sharing',
        'Advanced analytics',
        'Priority email support',
        'Product performance insights'
      ],
      limitations: [
        'Limited to 35 products',
        'No AI automation',
        'Manual product updates'
      ],
      popular: true
    },
    {
      id: 'unlimited_20',
      name: 'Unlimited',
      price: '$20',
      period: '/month',
      products: 'Unlimited',
      features: [
        'Unlimited products',
        'AI automation tools',
        'Auto-social sharing',
        '24/7 priority support',
        'Advanced analytics',
        'Smart product recommendations',
        'Competitive pricing insights'
      ],
      limitations: [],
      popular: false
    }
  ]

  const handleSubscribe = async (planId: string) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please login first')
        return
      }

      const maxProducts = planId === 'basic_5' ? 15 : planId === 'pro_10' ? 35 : 9999

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          seller_id: user.id,
          plan: planId,
          max_products: maxProducts,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          active: true
        }, {
          onConflict: 'seller_id'
        })

      if (error) throw error
      
      alert(`✅ Successfully upgraded to ${plans.find(p => p.id === planId)?.name} plan!`)
      window.location.href = '/dashboard/seller'
    } catch (error: any) {
      alert(error.message || 'Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentPlanName = () => {
    const plan = plans.find(p => p.id === currentPlan)
    return plan ? plan.name : 'Free Trial'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-700">Choose Your Plan</h1>
            <p className="text-gray-600 mt-1">Upgrade to unlock more features and products</p>
          </div>
          <Link href="/dashboard/seller" className="text-gray-600 hover:text-amber-600">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Current Plan Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <p className="text-2xl font-bold text-amber-700">{getCurrentPlanName()}</p>
            </div>
            {subscription && subscription.plan === 'free_trial' && (
              <div className="bg-amber-100 border border-amber-300 rounded-lg px-4 py-2">
                <p className="text-sm text-amber-800">
                  ⏳ {Math.ceil((new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id
            const isFreeTrial = currentPlan === 'free_trial'
            
            return (
              <div 
                key={plan.id} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-amber-500 relative' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-amber-500 text-white text-center py-1 text-sm font-semibold">
                    🌟 MOST POPULAR
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-amber-700">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600 font-semibold">Features:</p>
                    <ul className="mt-2 space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-600 font-semibold">Limitations:</p>
                      <ul className="mt-2 space-y-2">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <span className="text-red-500 mr-2">✗</span>
                            <span className="text-gray-500">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading || isCurrent}
                    className={`mt-6 w-full py-3 rounded-lg font-bold transition ${
                      isCurrent
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {isCurrent ? '✓ Current Plan' : isFreeTrial && plan.id === 'basic_5' ? 'Start Trial' : 'Subscribe Now'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Plan Comparison</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Feature</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Basic</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Pro</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Unlimited</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-700">Max Products</td>
                <td className="text-center py-3 px-4 text-gray-700">15</td>
                <td className="text-center py-3 px-4 text-gray-700">35</td>
                <td className="text-center py-3 px-4 text-gray-700 font-bold text-amber-700">♾️ Unlimited</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-700">AI Automation</td>
                <td className="text-center py-3 px-4 text-gray-400">✗</td>
                <td className="text-center py-3 px-4 text-gray-400">✗</td>
                <td className="text-center py-3 px-4 text-green-600">✓</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-700">Social Media Integration</td>
                <td className="text-center py-3 px-4 text-green-600">✓</td>
                <td className="text-center py-3 px-4 text-green-600">✓</td>
                <td className="text-center py-3 px-4 text-green-600">✓</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-700">Analytics</td>
                <td className="text-center py-3 px-4 text-gray-600">Basic</td>
                <td className="text-center py-3 px-4 text-gray-600">Advanced</td>
                <td className="text-center py-3 px-4 text-gray-600">Premium</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-700">Support</td>
                <td className="text-center py-3 px-4 text-gray-600">Email</td>
                <td className="text-center py-3 px-4 text-gray-600">Priority</td>
                <td className="text-center py-3 px-4 text-gray-600">24/7 Priority</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700 font-semibold">Price</td>
                <td className="text-center py-3 px-4 font-bold text-amber-700">$5/month</td>
                <td className="text-center py-3 px-4 font-bold text-amber-700">$10/month</td>
                <td className="text-center py-3 px-4 font-bold text-amber-700">$20/month</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700">What happens after my free trial?</h4>
              <p className="text-gray-600 text-sm">Your account will be downgraded to view-only mode. Upgrade to continue selling.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Can I switch plans later?</h4>
              <p className="text-gray-600 text-sm">Yes! You can upgrade or downgrade your plan at any time.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm">We accept EcoCash, OneMoney, InnBucks, and bank transfers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
        }
