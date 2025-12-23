'use server'

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role key to bypass RLS for public signups
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function subscribeUser(prevState: any, formData: FormData) {
  // Extract phone field from formData
  const phone = formData.get('phone') as string

  // Validation: Return error if field is empty
  if (!phone || phone.trim() === '') {
    return {
      success: false,
      message: 'Phone number is required',
    }
  }

  // Formatting: Strip all non-numeric characters
  const cleanNumber = phone.replace(/\D/g, '')

  // If exactly 10 digits, prepend '1' to make it E.164 compliant
  let formattedNumber: string
  if (cleanNumber.length === 10) {
    formattedNumber = `1${cleanNumber}`
  } else if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
    formattedNumber = cleanNumber
  } else {
    return {
      success: false,
      message: 'Please enter a valid 10-digit phone number',
    }
  }

  try {
    // Insertion: Insert the cleaned number into textament_subscribers table
    const { error } = await supabase
      .from('textament_subscribers')
      .insert({
        phone_number: formattedNumber,
        active: true,
      })

    if (error) {
      // Handle duplicate number error (Postgres error code 23505)
      if (error.code === '23505') {
        return {
          success: true,
          message: "You're already on the list!",
        }
      }
      // Other errors
      throw error
    }

    return {
      success: true,
      message: 'Successfully subscribed!',
    }
  } catch (error) {
    console.error('Error subscribing user:', error)
    return {
      success: false,
      message: 'Failed to subscribe. Please try again later.',
    }
  }
}




