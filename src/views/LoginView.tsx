import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const inputClass =
  'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-base text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500'

export function LoginView() {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setStep('code')
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    setLoading(false)
    if (error) {
      setError(error.message)
    }
    // On success, supabase-js updates the session internally and App's
    // onAuthStateChange listener picks it up - no local state to set here.
  }

  return (
    <div className="min-h-svh flex justify-center items-center bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Dose Atlas</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {step === 'email' ? 'Log in to continue' : `Enter the code sent to ${email || 'your email'}`}
          </p>
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {step === 'email' && (
          <form className="flex flex-col gap-3" onSubmit={handleSendCode}>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-purple-600 text-white font-medium py-2.5 hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send code'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form className="flex flex-col gap-3" onSubmit={handleVerify}>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              placeholder="••••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className={inputClass}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-purple-600 text-white font-medium py-2.5 hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setError(null)
              }}
              className="text-sm text-neutral-500"
            >
              ← Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
