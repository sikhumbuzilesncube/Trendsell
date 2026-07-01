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
  created_at: string
  categories: {
    name: string
  }
}

export default function SupplierProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        window.location.href = '/auth/login'
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .eq('supplier_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      setProducts(products.filter(p => p.id !== productId))
      alert('Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-700">📦 My Products</h1>
          <div className="flex gap-4">
            <Link href="/dashboard/supplier/products/new" className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg transition">
              + Add Product
            </Link>
            <Link href="/dashboard/supplier" className="text-gray-600 hover:text-green-600">
              ← Back
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-600">No products listed yet</h3>
            <p className="text-gray-500">Start by adding your first product</p>
            <Link href="/dashboard/supplier/products/new" className="inline-block mt-4 bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition">
              List Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl">📦</div>
                  )}
                  {product.verified ? (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">✅ Verified</span>
                  ) : (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">⏳ Pending</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.categories?.name || 'Uncategorized'}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Wholesale</p>
                      <p className="font-bold text-green-600">${product.wholesale_price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Retail</p>
                      <p className="font-bold text-amber-600">${product.final_price}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Stock: {product.stock_quantity} • Margin: {product.seller_profit_margin}%
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2 px-3 rounded-lg transition"
                    >
                      Delete
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
    }
