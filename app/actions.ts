'use server'

import { supabase } from '@/lib/supabase'

export async function subscribeUser(phoneNumber: string) {
  // Basic phone number validation
  const phoneRegex = /^\+[1-9]\d{1,14}$/
  
  if (!phoneRegex.test(phoneNumber.trim())) {
    return {
      success: false,
      error: 'Please enter a valid phone number with country code (e.g., +1234567890)',
    }
  }

  try {
    // Check if phone number already exists
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, active')
      .eq('phone_number', phoneNumber.trim())
      .single()

    if (existing) {
      if (existing.active) {
        return {
          success: false,
          error: 'This phone number is already subscribed.',
        }
      } else {
        // Reactivate existing subscriber
        const { error } = await supabase
          .from('subscribers')
          .update({ active: true })
          .eq('id', existing.id)

        if (error) throw error

        return {
          success: true,
        }
      }
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('subscribers')
      .insert({
        phone_number: phoneNumber.trim(),
        active: true,
      })

    if (error) throw error

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error subscribing user:', error)
    return {
      success: false,
      error: 'Failed to subscribe. Please try again later.',
    }
  }
}

