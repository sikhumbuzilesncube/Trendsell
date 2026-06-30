'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface UserData {
  name: string
  surname: string
  store_name: string
  email: string
  phone: string
  verified: boolean
}

interface Subscription {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          window.location.href = '/auth/login'
          return
        }

        // Get user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (!userError && userData) {
          setUser(userData)
        }

        // Get subscription
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('seller_id', authUser.id)
          .single()

        if (!subError && subData) {
          setSubscription(subData)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-amber-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            TrendSell
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {user.store_name || 'My Store'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-amber-700 hover:bg-amber-800 px-4 py-2 rounded-lg text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
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
            Email: {user.email} • Phone: {user.phone}
          </p>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-lg mb-2">📋 Subscription Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="font-semibold capitalize">{subscription.plan.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Products</p>
                <p className="font-semibold">{subscription.max_products}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-semibold ${subscription.active ? 'text-green-600' : 'text-red-600'}`}>
                  {subscription.active ? '✅ Active' : '❌ Inactive'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trial Ends</p>
                <p className="font-semibold">
                  {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/seller/products" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-3">🛒</div>
            <h3 className="font-bold text-lg">Browse Products</h3>
            <p className="text-sm text-gray-600">Find products to add to your store</p>
          </Link>

          <Link href="/dashboard/seller/store" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-3">🏪</div>
            <h3 className="font-bold text-lg">My Store</h3>
            <p className="text-sm text-gray-600">Manage your store products</p>
          </Link>

          <Link href="/dashboard/seller/orders" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="font-bold text-lg">Orders</h3>
            <p className="text-sm text-gray-600">View your orders and earnings</p>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-amber-600">0</p>
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
            <p className="text-sm text-gray-500">Trial Days Left</p>
            <p className="text-2xl font-bold text-amber-600">
              {subscription ? Math.ceil((new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
