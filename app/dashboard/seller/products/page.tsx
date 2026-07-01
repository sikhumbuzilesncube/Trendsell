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

interface Subscription {
  id: string
  plan: string
  max_products: number
  start_date: string
  end_date: string
  active: boolean
}

export default function BrowseProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [addingToStore, setAddingToStore] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [storeProducts, setStoreProducts] = useState<string[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([
      getCurrentUser(),
      fetchProducts(),
      fetchCategories()
    ])
  }

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      await fetchSubscription(user.id)
      await fetchStoreProducts(user.id)
    }
  }

  const fetchSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('seller_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Subscription error:', error)
      } else if (data) {
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const fetchStoreProducts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('seller_products')
        .select('product_id')
        .eq('seller_id', userId)
        .eq('active', true)

      if (error) {
        console.error('Store products error:', error)
      } else if (data) {
        setStoreProducts(data.map(item => item.product_id))
      }
    } catch (error) {
      console.error('Error fetching store products:', error)
    }
  }

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
        .gt('stock_quantity', 0)
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
      if (!user) {
        alert('Please login first')
        return
      }

      // Check if already in store
      if (storeProducts.includes(productId)) {
        alert('Product already in your store!')
        return
      }

      // Check subscription
      if (!subscription) {
        alert('Please subscribe to add products to your store')
        return
      }

      if (!subscription.active) {
        alert('Your subscription is inactive. Please renew.')
        return
      }

      // Check product limit
      const { count, error: countError } = await supabase
        .from('seller_products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('active', true)

      if (countError) {
        console.error('Count error:', countError)
      }

      if (count !== null && count >= subscription.max_products) {
        alert(`You've reached your limit of ${subscription.max_products} products. Upgrade your subscription!`)
        return
      }

      // Get the product to get the final price
      const product = products.find(p => p.id === productId)
      if (!product) {
        throw new Error('Product not found')
      }

      // Add to store
      const { error: insertError } = await supabase
        .from('seller_products')
        .insert({
          seller_id: user.id,
          product_id: productId,
          price: product.final_price,
          active: true
        })

      if (insertError) throw insertError

      setStoreProducts([...storeProducts, productId])
      alert('Product added to your store successfully! 🎉')
      
    } catch (error: any) {
      console.error('Error adding to store:', error)
      alert(error.message || 'Failed to add product to store')
    } finally {
      setAddingToStore(null)
    }
  }

  const shareProduct = (product: Product, platform: string) => {
    const text = `🛍️ Check out ${product.name} at my store! Price: $${product.final_price}\n\nShop now: https://trendsell.co.zw/product/${product.id}`
    
    let shareUrl = ''
    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://trendsell.co.zw/product/${product.id}`)}&quote=${encodeURIComponent(text)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
        break
      case 'instagram':
        navigator.clipboard.writeText(`${text}\n\n📸 Images: ${product.image_urls?.[0] || ''}`)
        alert('✅ Product details copied! Open Instagram and paste to share.')
        return
      case 'tiktok':
        navigator.clipboard.writeText(`${text}\n\n📸 Images: ${product.image_urls?.[0] || ''}`)
        alert('✅ Product details copied! Open TikTok and paste to share.')
        return
      default:
        return
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const shareAllPlatforms = async (product: Product) => {
    try {
      const text = `🛍️ ${product.name}\n💰 Price: $${product.final_price}\n📦 ${product.description || ''}\n\nShop now: https://trendsell.co.zw/product/${product.id}`
      
      await navigator.clipboard.writeText(`${text}\n\n📸 Images: ${product.image_urls?.[0] || ''}`)
      
      // Open WhatsApp
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
      
      alert('✅ Product details copied to clipboard! Share on any platform.')
    } catch (error) {
      console.error('Error sharing:', error)
      alert('Failed to share. Please try again.')
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
          <h1 className="text-3xl font-bold text-amber-700">🛒 Browse Products</h1>
          <div className="flex gap-4">
            <Link href="/dashboard/seller/store" className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition">
              🏪 My Store ({storeProducts.length})
            </Link>
            <Link href="/dashboard/seller" className="text-gray-600 hover:text-amber-600">
              ← Back
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <div className="bg-amber-50 rounded-xl shadow-lg p-4 mb-6 border border-amber-200">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <p className="text-sm text-gray-600">
                  📋 {subscription.plan === 'free_trial' ? 'Free Trial' : subscription.plan}
                </p>
                <p className="text-xs text-gray-500">
                  {subscription.max_products} products allowed • {storeProducts.length} in store
                </p>
              </div>
              <Link 
                href="/dashboard/seller/subscribe" 
                className="text-sm bg-amber-600 hover:bg-amber-700 text-white font-bold py-1 px-4 rounded-lg transition"
              >
                {subscription.plan === 'free_trial' ? 'Upgrade Plan' : 'Manage Subscription'}
              </Link>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-600">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isInStore = storeProducts.includes(product.id)
              const isAdding = addingToStore === product.id
              
              return (
                <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                  {/* Product Image */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                    {product.image_urls && product.image_urls.length > 0 ? (
                      <img 
                        src={product.image_urls[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">📦</div>
                    )}
                    {product.verified && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✅
                      </span>
                    )}
                    {isInStore && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                        In Store
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.categories?.name || 'Uncategorized'}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description || 'No description'}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Wholesale</p>
                        <p className="text-sm font-semibold text-gray-600">${product.wholesale_price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Your Price</p>
                        <p className="text-xl font-bold text-amber-600">${product.final_price}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      Profit: {product.seller_profit_margin}% • Stock: {product.stock_quantity}
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-3 space-y-2">
                      {!isInStore ? (
                        <button
                          onClick={() => addToStore(product.id)}
                          disabled={isAdding}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                        >
                          {isAdding ? 'Adding...' : '🛒 Add to Store'}
                        </button>
                      ) : (
                        <Link
                          href="/dashboard/seller/store"
                          className="w-full block text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                        >
                          ✅ In Store - View
                        </Link>
                      )}

                      {/* Quick Share Dropdown */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => shareProduct(product, 'whatsapp')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
                        >
                          💬 Share
                        </button>
                        <button
                          onClick={() => shareAllPlatforms(product)}
                          className="flex-1 bg-gray-700 hover:bg-gray-800 text-white text-sm font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
                        >
                          📤 All
                        </button>
                        <Link
                          href={`/product/${product.id}`}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2 px-3 rounded-lg transition text-center"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
  }
