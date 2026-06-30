'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function SellerSignup() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    storeName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    paymentMethod: 'mobile_money',
    mobileProvider: '',
    mobileNumber: '',
    bankName: '',
    accountNumber: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            surname: formData.surname,
            store_name: formData.storeName,
            phone: formData.phone,
            role: 'seller'
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('User creation failed')
      }

      console.log('User created:', authData.user.id)

      // 2. Create user in database
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          surname: formData.surname,
          store_name: formData.storeName,
          phone: formData.phone,
          role: 'seller',
          verified: false
        })

      if (dbError) {
        console.error('DB Error:', dbError)
        throw dbError
      }

      console.log('User inserted into database')

      // 3. Create payment method
      const paymentData = {
        user_id: authData.user.id,
        type: formData.paymentMethod || 'mobile_money',
        provider: formData.mobileProvider || formData.bankName || null,
        account_number: formData.mobileNumber || formData.accountNumber || 'Pending'
      }

      const { error: paymentError } = await supabase
        .from('payment_methods')
        .insert(paymentData)

      if (paymentError) {
        console.error('Payment Error:', paymentError)
        // Don't fail the whole signup
      }

      console.log('Payment method saved')

      // 4. Create subscription for 14-day trial
      const subscriptionData = {
        seller_id: authData.user.id,
        plan: 'free_trial',
        max_products: 5,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        active: true
      }

      console.log('Creating subscription:', subscriptionData)

      const { error: subError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)

      if (subError) {
        console.error('Subscription Error:', subError)
        // Still show success, but log error
      } else {
        console.log('Subscription created successfully')
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/dashboard/seller'
      }, 2000)

    } catch (err: any) {
      console.error('Signup Error:', err)
      setError(err.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  // ... rest of the component (the JSX form) stays the same ...
    }
