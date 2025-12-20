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
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Cross symbol */}
        <div className="flex justify-center mb-8">
          <div className="relative w-8 h-8">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black transform -translate-y-1/2"></div>
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-black transform -translate-x-1/2"></div>
          </div>
        </div>

        {/* Header section */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-7xl font-bold mb-6 text-black tracking-tight">
            Textament
          </h1>
          <div className="w-24 h-0.5 bg-black mx-auto mb-6"></div>
          <p className="font-sans text-xl text-black/90 leading-relaxed">
            Daily Wisdom & Drive.<br />
            Sent to your phone.
          </p>
        </div>

        {/* Form section */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="phoneNumber" className="block font-sans text-sm font-semibold mb-3 text-black uppercase tracking-wide">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black" size={20} strokeWidth={2} />
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                required
                className="w-full pl-12 pr-4 py-5 font-sans text-black bg-transparent border-2 border-black focus:outline-none focus:ring-0 focus:border-black transition-colors"
                disabled={status === 'loading'}
              />
            </div>
            <p className="mt-3 font-sans text-xs text-black/60 uppercase tracking-wide">
              Include country code (e.g., +1 for US)
            </p>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-5 px-6 font-sans font-semibold text-black bg-transparent border-2 border-black hover:bg-black hover:text-background transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </main>
  )
}

