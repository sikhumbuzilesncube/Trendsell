'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

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
  })
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Error fetching categories:', error)
      } else {
        setCategories(data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const selectedFiles = Array.from(files)
    
    // Check total images (max 8)
    if (imageFiles.length + selectedFiles.length > 8) {
      setError('Maximum 8 images allowed')
      return
    }

    // Check file sizes (max 5MB each)
    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`Image ${file.name} is too large. Max 5MB allowed.`)
        return
      }
    }

    // Create previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...newPreviews])
    setImageFiles([...imageFiles, ...selectedFiles])
    setError('')
  }

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
    
    // Revoke object URL to free memory
    URL.revokeObjectURL(imagePreviews[index])
  }

  const uploadImages = async (productId: string): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId}/${Date.now()}_${i}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw new Error(`Failed to upload image ${i + 1}: ${error.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
      setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100))
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setUploadProgress(0)

    try {
      if (!user) {
        throw new Error('Please login first')
      }

      // Validate form
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

      if (imageFiles.length === 0) {
        throw new Error('Please add at least one product image')
      }

      if (imageFiles.length < 4) {
        setError('⚠️ Adding at least 4 images is recommended for better visibility')
        // Still allow submission but warn
      }

      const finalPrice = wholesalePrice + (wholesalePrice * profitMargin / 100)

      // First, create the product
      const { data: productData, error: insertError } = await supabase
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
          image_urls: [], // Will update after upload
          verified: false
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Then upload images and get URLs
      setUploading(true)
      const imageUrls = await uploadImages(productData.id)

      // Update product with image URLs
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_urls: imageUrls })
        .eq('id', productData.id)

      if (updateError) throw updateError

      setSuccess(true)
      setFormData({
        name: '',
        description: '',
        category_id: '',
        wholesale_price: '',
        seller_profit_margin: '',
        stock_quantity: '',
      })
      setImageFiles([])
      setImagePreviews([])
      setUploadProgress(0)
      setUploading(false)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setTimeout(() => {
        setSuccess(false)
      }, 5000)

    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setUploading(false)
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

          {uploading && (
            <div className="bg-blue-50 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg mb-4">
              <p>📤 Uploading images... {uploadProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
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

            {/* Category */}
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

            {/* Product Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Images *</label>
              <p className="text-xs text-gray-500 mb-2">
                Upload up to 8 images (Max 5MB each). At least 4 recommended.
              </p>
              
              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="text-4xl mb-2">📸</div>
                <p className="text-gray-600">Click to upload images</p>
                <p className="text-xs text-gray-400">or drag and drop</p>
                <p className="text-xs text-gray-400 mt-2">
                  {imageFiles.length} images selected (max 8)
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={preview} 
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                      <span className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {imageFiles.length > 0 && imageFiles.length < 4 && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Adding {4 - imageFiles.length} more images is recommended
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading || uploading ? 'Processing...' : 'List Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
    }
