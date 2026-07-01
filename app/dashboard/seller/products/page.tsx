'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  wholesale_price: number
  seller_profit_margin: number
  final_price: number
  stock_quantity: number
  image_urls: string[]
  verified: boolean
  supplier_id: string
  category_id: string
  created_at: string
  categories: {
    name: string
  }
  users: {
    name: string
    surname: string
    store_name: string
  }
}

export default function BrowseProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [addingToStore, setAddingToStore] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          users (name, surname, store_name)
        `)
        .eq('verified', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
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

  const addToStore = async (productId: string) => {
    setAddingToStore(productId)
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        alert('Please login first')
        return
      }

      // Check subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('seller_id', user.id)
        .single()

      if (subError || !subData || !subData.active) {
        alert('Please subscribe to add products to your store')
        return
      }

      // Check if already in store
      const { data: existing, error: existingError } = await supabase
        .from('seller_products')
        .select('*')
        .eq('seller_id', user.id)
        .eq('product_id', productId)
        .single()

      if (existing) {
        alert('Product already in your store!')
        return
      }

      // Check product limit
      const { count, error: countError } = await supabase
        .from('seller_products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)

      if (count && count >= subData.max_products) {
        alert(`You've reached your limit of ${subData.max_products} products. Upgrade your subscription!`)
        return
      }

      // Add to store
      const { error: insertError } = await supabase
        .from('seller_products')
        .insert({
          seller_id: user.id,
          product_id: productId,
          price: products.find(p => p.id === productId)?.final_price || 0,
          active: true
        })

      // Add this function after the addToStore function
const shareProduct = (product: any) => {
  const text = `🛍️ Check out ${product.name} at my store! Price: $${product.final_price}\n\nShop now: https://trendsell.co.zw/product/${product.id}`
  
  // Open WhatsApp
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

      if (insertError) throw insertError
      alert('Product added to your store successfully! 🎉')
      
    } catch (error: any) {
      console.error('Error adding to store:', error)
      alert(error.message || 'Failed to add product to store')
    } finally {
      setAddingToStore(null)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                          product.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || product.category_id === category
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-700">Browse Products</h1>
          <Link href="/dashboard/seller" className="text-gray-600 hover:text-amber-600">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-600">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl">📦</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg truncate">{product.name}</h3>
                    {product.verified && (
                      <span className="text-green-500 text-sm">✅ Verified</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.categories?.name || 'Uncategorized'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {product.description || 'No description'}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Wholesale</p>
                      <p className="text-lg font-bold text-green-600">${product.wholesale_price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Your Price</p>
                      <p className="text-lg font-bold text-amber-600">${product.final_price}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Profit: {product.seller_profit_margin}% • Stock: {product.stock_quantity}
                  </p>
                  <button
                    onClick={() => addToStore(product.id)}
                    disabled={addingToStore === product.id}
                    className="mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                  >
                    {addingToStore === product.id ? 'Adding...' : 'Add to Store 🛒'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
    }
