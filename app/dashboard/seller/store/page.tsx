'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface StoreProduct {
  id: string
  price: number
  added_at: string
  active: boolean
  product_id: string
  products: {
    id: string
    name: string
    description: string
    wholesale_price: number
    final_price: number
    image_urls: string[]
    stock_quantity: number
    verified: boolean
    categories: {
      name: string
    }
    users: {
      name: string
      surname: string
    }
  }
}

export default function SellerStore() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [sharing, setSharing] = useState<string | null>(null)

  useEffect(() => {
    fetchStoreProducts()
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchStoreProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        window.location.href = '/auth/login'
        return
      }

      const { data, error } = await supabase
        .from('seller_products')
        .select(`
          *,
          products (
            id,
            name,
            description,
            wholesale_price,
            final_price,
            image_urls,
            stock_quantity,
            verified,
            categories (name),
            users (name, surname)
          )
        `)
        .eq('seller_id', user.id)
        .eq('active', true)
        .order('added_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching store products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (sellerProductId: string) => {
    if (!confirm('Remove this product from your store?')) return

    try {
      const { error } = await supabase
        .from('seller_products')
        .update({ active: false })
        .eq('id', sellerProductId)

      if (error) throw error

      setProducts(products.filter(p => p.id !== sellerProductId))
      alert('Product removed from store')
    } catch (error) {
      console.error('Error removing product:', error)
      alert('Failed to remove product')
    }
  }

  const shareToSocial = (platform: string, product: StoreProduct) => {
    const productName = product.products.name
    const productPrice = product.price
    const storeName = user?.user_metadata?.store_name || 'My Store'
    
    // Get the first image or use a default
    const imageUrl = product.products.image_urls?.[0] || ''
    
    // Build the sharing URL
    let shareUrl = ''
    const siteUrl = 'https://trendsell.co.zw'
    const productUrl = `${siteUrl}/product/${product.products.id}`
    
    const text = `🛍️ Check out ${productName} at ${storeName}! Price: $${productPrice}\n\nShop now: ${productUrl}`
    const hashtags = 'TrendSell,ZimbabweShopping,OnlineShopping'

    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(text)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=${hashtags}`
        break
      case 'instagram':
        // Instagram doesn't support direct sharing via URL
        // Copy to clipboard instead
        navigator.clipboard.writeText(`${text}\n\nImages: ${imageUrl}`)
        alert('✅ Product details copied! Open Instagram and paste to share.')
        return
      case 'tiktok':
        // TikTok doesn't support direct sharing via URL
        // Copy to clipboard instead
        navigator.clipboard.writeText(`${text}\n\nImages: ${imageUrl}`)
        alert('✅ Product details copied! Open TikTok and paste to share.')
        return
      default:
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const shareAllPlatforms = async (product: StoreProduct) => {
    setSharing(product.id)
    try {
      const productName = product.products.name
      const productPrice = product.price
      const storeName = user?.user_metadata?.store_name || 'My Store'
      const siteUrl = 'https://trendsell.co.zw'
      const productUrl = `${siteUrl}/product/${product.products.id}`
      const imageUrl = product.products.image_urls?.[0] || ''
      
      const text = `🛍️ Check out ${productName} at ${storeName}! Price: $${productPrice}\n\nShop now: ${productUrl}`
      
      // Copy to clipboard for all platforms
      await navigator.clipboard.writeText(`${text}\n\n📸 Images: ${imageUrl}`)
      
      // Open WhatsApp (most common in Zimbabwe)
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
      
      alert('✅ Product details copied to clipboard! Share on any platform.')
    } catch (error) {
      console.error('Error sharing:', error)
      alert('Failed to share. Please try again.')
    } finally {
      setSharing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading your store...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-amber-700">🏪 My Store</h1>
          <div className="flex gap-4">
            <Link href="/dashboard/seller/products" className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition">
              + Add Products
            </Link>
            <Link href="/dashboard/seller" className="text-gray-600 hover:text-amber-600">
              ← Back
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-bold text-gray-600">Your store is empty</h3>
            <p className="text-gray-500">Browse products and add them to your store</p>
            <Link href="/dashboard/seller/products" className="inline-block mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg transition">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                {/* Product Image */}
                <div className="h-56 bg-gray-200 flex items-center justify-center relative">
                  {product.products.image_urls && product.products.image_urls.length > 0 ? (
                    <img 
                      src={product.products.image_urls[0]} 
                      alt={product.products.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">📦</div>
                  )}
                  {product.products.verified && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✅ Verified
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg truncate">{product.products.name}</h3>
                  <p className="text-sm text-gray-500">{product.products.categories?.name || 'Uncategorized'}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.products.description || 'No description'}</p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Your Price</p>
                      <p className="text-2xl font-bold text-amber-600">${product.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Supplier</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {product.products.users?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Added: {new Date(product.added_at).toLocaleDateString()}
                  </p>

                  {/* Social Media Sharing Section */}
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">📱 Share This Product</p>
                    <div className="grid grid-cols-5 gap-2">
                      <button
                        onClick={() => shareToSocial('whatsapp', product)}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
                        title="Share on WhatsApp"
                      >
                        <span className="text-xl">💬</span>
                      </button>
                      <button
                        onClick={() => shareToSocial('facebook', product)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
                        title="Share on Facebook"
                      >
                        <span className="text-xl">📘</span>
                      </button>
                      <button
                        onClick={() => shareToSocial('twitter', product)}
                        className="bg-black hover:bg-gray-800 text-white p-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
                        title="Share on X (Twitter)"
                      >
                        <span className="text-xl">🐦</span>
                      </button>
                      <button
                        onClick={() => shareToSocial('instagram', product)}
                        className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
                        title="Share on Instagram"
                      >
                        <span className="text-xl">📸</span>
                      </button>
                      <button
                        onClick={() => shareToSocial('tiktok', product)}
                        className="bg-black hover:bg-gray-800 text-white p-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
                        title="Share on TikTok"
                      >
                        <span className="text-xl">🎵</span>
                      </button>
                    </div>

                    {/* Share All Button */}
                    <button
                      onClick={() => shareAllPlatforms(product)}
                      disabled={sharing === product.id}
                      className="mt-2 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm disabled:opacity-50"
                    >
                      {sharing === product.id ? 'Sharing...' : '📤 Share All Platforms'}
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
                  >
                    Remove from Store
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
