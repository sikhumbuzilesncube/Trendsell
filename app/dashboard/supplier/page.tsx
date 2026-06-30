'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface UserData {
  id: string
  name: string
  surname: string
  email: string
  phone: string
  verified: boolean
}

export default function SupplierDashboard() {
  const [user, setUser] = useState<UserData | null>(null)
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

        // Count products
        const { count, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('supplier_id', authUser.id)

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
          <Link href="/auth/login" className="text-green-600 hover:underline">
            Login here
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-green-700 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">📦 TrendSell</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-green-600 px-3 py-1 rounded-full">
              {user.verified ? '✅ Verified Supplier' : '🔒 Unverified'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-green-800 hover:bg-green-900 px-4 py-2 rounded-lg text-sm transition"
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
          <h2 className="text-3xl font-bold text-green-700 mb-2">
            Welcome, {user.name}! 👋
          </h2>
          <p className="text-gray-600">
            {user.verified ? '✅ Verified Supplier' : '🔒 Unverified Supplier'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            📧 {user.email} • 📱 {user.phone}
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/supplier/products/new" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-transparent hover:border-green-300">
            <div className="text-4xl mb-3">➕</div>
            <h3 className="font-bold text-lg">List New Product</h3>
            <p className="text-sm text-gray-600">Add wholesale products for sellers</p>
          </Link>

          <Link href="/dashboard/supplier/products" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-transparent hover:border-green-300">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-bold text-lg">My Products</h3>
            <p className="text-sm text-gray-600">Manage your product listings</p>
          </Link>

          <Link href="/dashboard/supplier/orders" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-transparent hover:border-green-300">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="font-bold text-lg">Orders</h3>
            <p className="text-sm text-gray-600">View and fulfill orders</p>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Products Listed</p>
            <p className="text-2xl font-bold text-green-600">{productCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Pending Orders</p>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Earnings</p>
            <p className="text-2xl font-bold text-green-600">$0.00</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Verified</p>
            <p className={`text-2xl font-bold ${user.verified ? 'text-green-600' : 'text-red-600'}`}>
              {user.verified ? '✅ Yes' : '❌ No'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
          }
