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
    image_urls: [] as string[]
  })
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [imageUrls, setImageUrls] = useState<string[]>(['', '', '', ''])

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
      setLoadingCategories(true)
      console.log('Fetching categories...')
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Error fetching categories:', error)
        setError('Could not load categories')
      } else {
        console.log('Categories loaded:', data)
        setCategories(data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Could not load categories')
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (index: number, value: string) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
  }

  const addImageField = () => {
    if (imageUrls.length < 8) {
      setImageUrls([...imageUrls, ''])
    }
  }

  const removeImageField = (index: number) => {
    if (imageUrls.length > 1) {
      const newUrls = imageUrls.filter((_, i) => i !== index)
      setImageUrls(newUrls)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!user) {
        throw new Error('Please login first')
      }

      const wholesalePrice = parseFloat(formData.wholesale_price)
      const profitMargin = parseFloat(formData.seller_profit_margin)
      const stockQuantity = parseInt(formData.stock_quantity) || 0

      if (isNaN(wholesalePrice) || wholesalePrice <= 0) {
        throw new Error('Please enter a valid wholesale price')
      }

      if (isNaN(profitMargin) || profitMargin < 0) {
        throw new Error('Please enter a valid profit margin')
      }

      if (!formData.category_id) {
        throw new Error('Please select a category')
      }

      const finalPrice = wholesalePrice + (wholesalePrice * profitMargin / 100)

      // Filter out empty image URLs
      const validImageUrls = imageUrls.filter(url => url.trim() !== '')

      if (validImageUrls.length === 0) {
        throw new Error('Please add at least one product image URL')
      }

      const { error: insertError } = await supabase
        .from('products')
        .insert({
          supplier_id: user.id,
          name: formData.name,
          description: formData.description,
          category_id: formData.category_id,
          wholesale_price: wholesalePrice,
          seller_profit_margin: profitMargin,
          final_price: finalPrice,
          stock_quantity: stockQuantity,
          image_urls: validImageUrls,
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
        image_urls: []
      })
      setImageUrls(['', '', '', ''])

      setTimeout(() => {
        setSuccess(false)
      }, 5000)

    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Calculate suggested retail price
  const wholesalePrice = parseFloat(formData.wholesale_price) || 0
  const profitMargin = parseFloat(formData.seller_profit_margin) || 0
  const suggestedPrice = wholesalePrice + (wholesalePrice * profitMargin / 100)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-700">List New Product</h1>
          <div className="flex gap-4">
            <Link href="/dashboard/supplier/products" className="text-gray-600 hover:text-green-600">
              ← My Products
            </Link>
            <Link href="/dashboard/supplier" className="text-gray-600 hover:text-green-600">
              Dashboard
            </Link>
          </div>
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
            {/* Product Name */}
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

            {/* Description */}
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

            {/* Category - FIXED with better loading state */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Select Category --</option>
                {loadingCategories ? (
                  <option value="" disabled>Loading categories...</option>
                ) : categories.length === 0 ? (
                  <option value="" disabled>⚠️ No categories found</option>
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                )}
              </select>
              {loadingCategories && (
                <p className="text-xs text-gray-500 mt-1">⏳ Loading categories...</p>
              )}
              {!loadingCategories && categories.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ No categories found. Please add categories in Supabase first.
                </p>
              )}
              {!loadingCategories && categories.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ {categories.length} categories available
                </p>
              )}
            </div>

            {/* Price and Margin */}
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

            {/* Suggested Retail Price */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700">
                💡 Suggested retail price for sellers: <strong>
                  ${suggestedPrice.toFixed(2)}
                </strong>
              </p>
            </div>

            {/* Stock Quantity */}
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

            {/* Product Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Images (at least 4 recommended) *</label>
              <p className="text-xs text-gray-500 mb-2">Enter image URLs for your product photos</p>
              
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder={`Image ${index + 1} URL`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={addImageField}
                  disabled={imageUrls.length >= 8}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  + Add Another Image
                </button>
                <span className="text-xs text-gray-500 self-center">
                  {imageUrls.filter(u => u.trim() !== '').length} images added
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                At least 4 images recommended for better product visibility
              </p>
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
