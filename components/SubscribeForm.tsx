'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useRef } from 'react'
import { subscribeUser } from '@/app/actions'
import { Phone } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-4 sm:py-5 px-4 sm:px-6 font-sans text-sm sm:text-base font-bold text-black bg-[#e8e4d9] border-2 border-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
    >
      {pending ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
    </button>
  )
}

export default function SubscribeForm() {
  const [state, formAction] = useFormState(subscribeUser, { success: false, message: '' })
  const formRef = useRef<HTMLFormElement>(null)

  // Reset form when success is true
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state?.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-6 sm:space-y-7 md:space-y-8">
      <div>
        <label htmlFor="phone" className="block font-sans text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-black uppercase tracking-wide">
          Phone Number
        </label>
        <div className="relative">
          <Phone 
            className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-black" 
            size={18} 
            strokeWidth={2} 
          />
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(555) 555-5555"
            required
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-4 sm:py-5 font-sans text-sm sm:text-base text-black bg-[#f4f1ea] border-2 border-black placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-black transition-colors"
          />
        </div>
      </div>

      <SubmitButton />

      {/* Feedback message */}
      {state?.message && (
        <p
          className={`font-sans text-sm sm:text-base ${
            state.success ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  )
}

