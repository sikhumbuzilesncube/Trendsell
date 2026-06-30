'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function Subscribe() {
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('seller_id', user.id)
          .maybeSingle()
        setSubscription(data)
      }
    }
    fetchSubscription()
  }, [])

  const plans = [
    { id: 'basic_5', name: 'Basic', price: '$5/mo', products: 15 },
    { id: 'pro_10', name: 'Pro', price: '$10/mo', products: 35 },
    { id: 'unlimited_20', name: 'Unlimited', price: '$20/mo', products: 'Unlimited' },
  ]

  const handleSubscribe = async (planId: string) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please login first')
        return
      }

      // Update subscription
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          seller_id: user.id,
          plan: planId,
          max_products: planId === 'basic_5' ? 15 : planId === 'pro_10' ? 35 : 999,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          active: true
        })

      if (error) throw error
      alert('Subscription updated successfully! 🎉')
      window.location.href = '/dashboard/seller'
    } catch (error: any) {
      alert(error.message || 'Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-700">Choose Your Plan</h1>
          <Link href="/dashboard/seller" className="text-gray-600 hover:text-amber-600">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <h3 className="text-2xl font-bold text-amber-700">{plan.name}</h3>
              <p className="text-4xl font-bold mt-2">{plan.price}</p>
              <p className="text-gray-600 mt-2">List up to {plan.products} products</p>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading || subscription?.plan === plan.id}
                className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
              >
                {subscription?.plan === plan.id ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
      }
