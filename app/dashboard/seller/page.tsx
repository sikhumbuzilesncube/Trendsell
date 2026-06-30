'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface UserData {
  id: string
  name: string
  surname: string
  store_name: string
  email: string
  phone: string
  verified: boolean
}

interface Subscription {
  id: string
  plan: string
  max_products: number
  start_date: string
  end_date: string
  active: boolean
}

export default function SellerDashboard() {
  const [user, setUser] = useState<UserData | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [productCount, setProductCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          window.location.href = '/auth/login'
          return
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (userError) {
          console.error('User error:', userError)
        } else if (userData) {
          setUser(userData)
        }

        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('seller_id', authUser.id)
          .maybeSingle()

        if (subError) {
          console.error('Subscription error:', subError)
        } else if (subData) {
          setSubscription(subData)
        }

        const { count, error: countError } = await supabase
          .from('seller_products')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', authUser.id)

        if (!countError && count !== null) {
          setProductCount(count)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in</p>
          <Link href="/auth/login" className="text-amber-600 hover:underline">
            Login here
          </Link>
        </div>
      </div>
    )
  }

  // Calculate trial days left
  let daysLeft = 0
  let trialEndDate = null
  if (subscription && subscription.end_date) {
    const end = new Date(subscription.end_date)
    const now = new Date()
    daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    trialEndDate = end.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getPlanName = (plan: string) => {
    const plans: { [key: string]: string } = {
      'free_trial': 'Free Trial',
      'basic_5': 'Basic ($5/mo)',
      'pro_10': 'Pro ($10/mo)',
      'unlimited_20': 'Unlimited ($20/mo)'
    }
    return plans[plan] || plan
  }

  const isUnlimited = subscription?.plan === 'unlimited_20'
  const isFreeTrial = subscription?.plan === 'free_trial'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-amber-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">🏪 TrendSell</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-amber-700 px-3 py-1 rounded-full">
              {user.store_name || 'My Store'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-amber-700 hover:bg-amber-800 px-4 py-2 rounded-lg text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-3xl font-bold text-amber-700 mb-2">
            Welcome, {user.name}! 👋
          </h2>
          <p className="text-gray-600">
            {user.verified ? '✅ Verified Seller' : '🔒 Unverified Seller'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            📧 {user.email} • 📱 {user.phone}
          </p>
        </div>

        {/* Subscription Status with Trial Countdown */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl shadow-lg p-6 mb-6 border-2 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-amber-800">📋 Subscription Status</h3>
            {subscription && subscription.active && (
              <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                ✅ Active
              </span>
            )}
          </div>
          
          {subscription ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-bold text-amber-700">{getPlanName(subscription.plan)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Max Products</p>
                  <p className="font-bold text-amber-700">{subscription.max_products}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Products in Store</p>
                  <p className="font-bold text-amber-700">{productCount} / {subscription.max_products}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trial Days Left</p>
                  <p className={`font-bold ${daysLeft <= 3 ? 'text-red-600' : 'text-amber-700'}`}>
                    {isFreeTrial ? `${daysLeft} days` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Trial Countdown Banner */}
              {isFreeTrial && (
                <div className="mt-4 bg-amber-200 rounded-lg p-4 border-2 border-amber-300">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-amber-800 font-semibold">
                        ⏰ Your 14-day free trial ends on {trialEndDate}
                      </p>
                      <p className="text-xs text-amber-700">
                        You have {daysLeft} days left to enjoy 5 free product listings
                      </p>
                    </div>
                    <Link 
                      href="/dashboard/seller/subscribe" 
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg transition text-sm"
                    >
                      Upgrade Now
                    </Link>
                  </div>
                </div>
              )}

              {/* Product Limitation Banner */}
              {isFreeTrial && productCount >= subscription.max_products && (
                <div className="mt-4 bg-red-100 border-2 border-red-300 rounded-lg p-4">
                  <p className="text-sm text-red-700 font-semibold">
                    ⚠️ You've reached your limit of {subscription.max_products} products!
                  </p>
                  <p className="text-xs text-red-600">
                    <Link href="/dashboard/seller/subscribe" className="font-bold hover:underline">
                      Upgrade now
                    </Link> to add more products to your store
                  </p>
                </div>
              )}

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Product usage</span>
                  <span>{productCount} / {subscription.max_products}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      productCount >= subscription.max_products ? 'bg-red-600' : 'bg-amber-600'
                    }`}
                    style={{ width: `${Math.min((productCount / subscription.max_products) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-amber-700">No active subscription found</p>
              <Link href="/dashboard/seller/subscribe" className="text-amber-600 hover:underline font-bold">
                Subscribe now →
              </Link>
            </div>
          )}
        </div>

        {/* AI Feature - Highlighted for Unlimited Plan */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 mb-6 border-2 border-purple-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🤖</div>
              <h3 className="font-bold text-xl text-purple-800">AI Power Tools</h3>
            </div>
            {isUnlimited ? (
              <span className="bg-purple-600 text-white text-xs px-4 py-2 rounded-full font-bold">
                ✅ ACTIVE
              </span>
            ) : (
              <span className="bg-gray-300 text-gray-600 text-xs px-4 py-2 rounded-full">
                🔒 Upgrade to Unlock
              </span>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl mb-2">🔄</div>
              <h4 className="font-bold text-purple-700">Auto-Add Products</h4>
              <p className="text-sm text-gray-600">AI finds trending products and adds them to your store automatically</p>
              {!isUnlimited && <div className="mt-2 text-xs text-purple-500">🔒 Unlimited only</div>}
            </div>
            <div className="bg-white rounded-lg p-4 shadow border-2 border-purple-300">
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-bold text-purple-700">Auto-Social Sharing</h4>
              <p className="text-sm text-gray-600">New products are automatically shared to WhatsApp, Facebook & more</p>
              {!isUnlimited && <div className="mt-2 text-xs text-purple-500">🔒 Unlimited only</div>}
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-bold text-purple-700">Smart Analytics</h4>
              <p className="text-sm text-gray-600">AI analyzes sales data to recommend best-performing products</p>
              {!isUnlimited && <div className="mt-2 text-xs text-purple-500">🔒 Unlimited only</div>}
            </div>
          </div>
          
          {!isUnlimited && (
            <div className="mt-4 bg-purple-200 rounded-lg p-4 border border-purple-300">
              <p className="text-sm text-purple-800">
                🚀 <Link href="/dashboard/seller/subscribe" className="font-bold hover:underline text-purple-900">
                  Upgrade to Unlimited ($20/mo)
                </Link> to unlock AI automation and grow your sales automatically!
              </p>
            </div>
          )}

          {isUnlimited && (
            <div className="mt-4 bg-purple-200 rounded-lg p-4 border border-purple-300">
              <p className="text-sm text-purple-800">
                ✅ Your AI tools are active! Your store is being optimized 24/7.
              </p>
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/seller/products" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-transparent hover:border-amber-300">
            <div className="text-4xl mb-3">🛒</div>
            <h3 className="font-bold text-lg">Browse Products</h3>
            <p className="text-sm text-gray-600">Find products to add to your store</p>
          </Link>

          <Link href="/dashboard/seller/store" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-transparent hover:border-amber-300">
            <div className="text-4xl mb-3">🏪</div>
            <h3 className="font-bold text-lg">My Store</h3>
            <p className="text-sm text-gray-600">Manage your store products</p>
          </Link>

          <Link href="/dashboard/seller/orders" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-transparent hover:border-amber-300">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="font-bold text-lg">Orders</h3>
            <p className="text-sm text-gray-600">View your orders and earnings</p>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-amber-600">{productCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Orders</p>
            <p className="text-2xl font-bold text-amber-600">0</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Earnings</p>
            <p className="text-2xl font-bold text-green-600">$0.00</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Store Views</p>
            <p className="text-2xl font-bold text-amber-600">0</p>
          </div>
        </div>
      </div>
    </div>
  )
                                                                        }
