'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  wholesale_price: number
  final_price: number
  stock_quantity: number
  image_urls: string[]
  verified: boolean
  created_at: string
  categories: {
    name: string
  }
  users: {
    name: string
    surname: string
    store_name: string
    phone: string
  }
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          users (name, surname, store_name, phone)
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const shareProduct = (platform: string) => {
    if (!product) return
    
    const text = `🛍️ ${product.name}\n💰 Price: $${product.final_price}\n📦 ${product.description || ''}\n\nShop now: https://trendsell.co.zw/product/${product.id}`
    
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
      default:
        return
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-600">Product not found</p>
          <Link href="/" className="text-amber-600 hover:underline">Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/" className="text-gray-600 hover:text-amber-600 mb-4 inline-block">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <img 
                    src={product.image_urls[currentImage]} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-8xl">📦</div>
                )}
              </div>
              {product.image_urls && product.image_urls.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {product.image_urls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        currentImage === index ? 'border-amber-500' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
                {product.verified && (
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                    ✅ Verified
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-2">{product.categories?.name}</p>
              <p className="text-gray-600 mt-4">{product.description || 'No description available'}</p>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-4xl font-bold text-amber-600">${product.final_price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className="font-semibold text-gray-700">{product.stock_quantity} units</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-semibold text-gray-700">
                  {product.users?.store_name || `${product.users?.name || 'Unknown'} ${product.users?.surname || ''}`}
                </p>
                {product.users?.phone && (
                  <p className="text-sm text-gray-500">{product.users.phone}</p>
                )}
              </div>

              {/* Share Buttons */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">📱 Share This Product</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => shareProduct('whatsapp')}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    onClick={() => shareProduct('facebook')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                  >
                    📘 Facebook
                  </button>
                  <button
                    onClick={() => shareProduct('twitter')}
                    className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                  >
                    🐦 X
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
