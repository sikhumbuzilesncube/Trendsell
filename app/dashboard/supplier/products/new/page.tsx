'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

export default function NewProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    wholesale_price: '',
    seller_profit_margin: '',
    stock_quantity: '',
    image_urls: ''
  })
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchCategories()
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!user) {
        throw new Error('Please login first')
      }

      // Parse numbers
      const wholesalePrice = parseFloat(formData.wholesale_price)
      const profitMargin = parseFloat(formData.seller_profit_margin)
      const stockQuantity = parseInt(formData.stock_quantity)

      if (isNaN(wholesalePrice) || wholesalePrice <= 0) {
        throw new Error('Please enter a valid wholesale price')
      }

      if (isNaN(profitMargin) || profitMargin < 0) {
        throw new Error('Please enter a valid profit margin')
      }

      // Calculate final price
      const finalPrice = wholesalePrice + (wholesalePrice * profitMargin / 100)

      // Parse image URLs
      const imageUrls = formData.image_urls
        ? formData.image_urls.split(',').map(url => url.trim()).filter(url => url)
        : []

      const { error: insertError } = await supabase
        .from('products')
        .insert({
          supplier_id: user.id,
          name: formData.name,
          description: formData.description,
          category_id: formData.category_id || null,
          wholesale_price: wholesalePrice,
          seller_profit_margin: profitMargin,
          final_price: finalPrice,
          stock_quantity: stockQuantity || 0,
          image_urls: imageUrls,
          verified: false
        })

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({
        name: '',
        description: '',
        category_id: '',
        wholesale_price: '',
        seller_profit_margin: '',
        stock_quantity: '',
        image_urls: ''
      })

      setTimeout(() => {
        setSuccess(false)
      }, 5000)

    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-700">List New Product</h1>
          <Link href="/dashboard/supplier" className="text-gray-600 hover:text-green-600">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              ✅ Product listed successfully!
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Samsung Galaxy S24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe your product..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Wholesale Price (USD) *</label>
                <input
                  type="number"
                  name="wholesale_price"
                  required
                  step="0.01"
                  min="0"
                  value={formData.wholesale_price}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="20.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Seller Profit Margin (%) *</label>
                <input
                  type="number"
                  name="seller_profit_margin"
                  required
                  step="0.1"
                  min="0"
                  value={formData.seller_profit_margin}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="10"
                />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700">
                💡 Suggested retail price for sellers: <strong>
                  ${formData.wholesale_price && formData.seller_profit_margin ? 
                    (parseFloat(formData.wholesale_price) + (parseFloat(formData.wholesale_price) * parseFloat(formData.seller_profit_margin) / 100)).toFixed(2) 
                    : '0.00'}
                </strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                min="0"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Image URLs (comma separated)</label>
              <input
                type="text"
                name="image_urls"
                value={formData.image_urls}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple URLs with commas</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Listing product...' : 'List Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
    }
