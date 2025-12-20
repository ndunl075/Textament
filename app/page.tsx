'use client'

import { useState } from 'react'
import { subscribeUser } from './actions'
import { Phone } from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const result = await subscribeUser(phoneNumber)
      if (result.success) {
        setStatus('success')
        setPhoneNumber('')
        toast.success('Successfully subscribed!', {
          description: 'You will receive daily texts starting tomorrow.',
          duration: 5000,
        })
      } else {
        setStatus('error')
        toast.error('Subscription failed', {
          description: result.error || 'Something went wrong. Please try again.',
          duration: 5000,
        })
      }
    } catch (error) {
      setStatus('error')
      toast.error('An unexpected error occurred', {
        description: 'Please try again later.',
        duration: 5000,
      })
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl w-full">
        {/* Cross symbol */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative w-6 h-6 sm:w-8 sm:h-8">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black transform -translate-y-1/2"></div>
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-black transform -translate-x-1/2"></div>
          </div>
        </div>

        {/* Header section */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5 md:mb-6 text-black tracking-tight">
            Textament
          </h1>
          <div className="w-16 sm:w-20 md:w-24 h-0.5 bg-black mx-auto mb-4 sm:mb-5 md:mb-6"></div>
          <p className="font-sans text-base sm:text-lg md:text-xl text-black/90 leading-relaxed px-2">
            Daily Wisdom & Drive.<br />
            Sent to your phone.
          </p>
        </div>

        {/* Form section */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7 md:space-y-8">
          <div>
            <label htmlFor="phoneNumber" className="block font-sans text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-black uppercase tracking-wide">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-black" size={18} strokeWidth={2} />
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                required
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-4 sm:py-5 font-sans text-sm sm:text-base text-black bg-transparent border-2 border-black focus:outline-none focus:ring-0 focus:border-black transition-colors"
                disabled={status === 'loading'}
              />
            </div>
            <p className="mt-2 sm:mt-3 font-sans text-xs text-black/60 uppercase tracking-wide px-1">
              Include country code (e.g., +1 for US)
            </p>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-4 sm:py-5 px-4 sm:px-6 font-sans text-sm sm:text-base font-semibold text-black bg-transparent border-2 border-black hover:bg-black hover:text-background transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] touch-manipulation"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </main>
  )
}

