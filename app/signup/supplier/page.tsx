'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SupplierSignup() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    paymentMethod: '',
    mobileProvider: '',
    mobileNumber: '',
    bankName: '',
    accountNumber: ''
  })
  
  const [loading, setLoading] = useState(false)

  const banks = [
    'CBZ', 'NMB', 'Stanbic', 'Standard Chartered', 
    'FBC', 'CABS', 'ZABG', 'First Capital', 'AFC', 'MetBank'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      setLoading(false)
      return
    }

    // Demo - just show success
    alert('Account created! (Supabase integration coming soon)')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Supplier Sign Up</h1>
        <p className="text-gray-600 mb-6">Join for free and start listing your products</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Surname *</label>
              <input
                type="text"
                name="surname"
                required
                value={formData.surname}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+263 77 123 4567"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
            <select
              name="paymentMethod"
              required
              value={formData.paymentMethod}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select payment method</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          {formData.paymentMethod === 'mobile_money' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Provider *</label>
                <select
                  name="mobileProvider"
                  required
                  value={formData.mobileProvider}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select provider</option>
                  <option value="EcoCash">EcoCash</option>
                  <option value="OneMoney">OneMoney</option>
                  <option value="InnBucks">InnBucks</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                <input
                  type="text"
                  name="mobileNumber"
                  required
                  placeholder="077 123 4567"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {formData.paymentMethod === 'bank_transfer' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank *</label>
                <select
                  name="bankName"
                  required
                  value={formData.bankName}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select bank</option>
                  {banks.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number *</label>
                <input
                  type="text"
                  name="accountNumber"
                  required
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up as Supplier'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-green-700 hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
    }
