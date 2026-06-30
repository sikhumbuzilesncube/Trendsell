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

  let daysLeft = 0
  if (subscription && subscription.end_date) {
    daysLeft = Math.ceil((new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
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
                  {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-amber-700">No active subscription found</p>
              <Link href="/dashboard/seller/subscribe" className="text-amber-600 hover:underline">
                Subscribe now →
              </Link>
            </div>
          )}

          {subscription && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-amber-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((productCount / subscription.max_products) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {productCount} of {subscription.max_products} products used
              </p>
            </div>
          )}

          {subscription && subscription.plan === 'free_trial' && (
            <div className="mt-4 bg-amber-200 rounded-lg p-3 border border-amber-300">
              <p className="text-sm text-amber-800">
                💡 You're on a free trial. <Link href="/dashboard/seller/subscribe" className="font-bold hover:underline">
                  Upgrade now
                </Link> to list more products!
              </p>
            </div>
          )}
        </div>

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
