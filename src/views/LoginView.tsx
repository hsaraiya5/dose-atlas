import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function LoginView() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendLink(e: React.FormEvent) {
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
    setSent(true)
  }

  return (
    <div className="min-h-svh flex justify-center items-center bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Dose Atlas</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {sent ? `Check your email (${email}) for a sign-in link` : 'Log in to continue'}
          </p>
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {!sent && (
          <form className="flex flex-col gap-3" onSubmit={handleSendLink}>
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
              {loading ? 'Sending...' : 'Send sign-in link'}
            </button>
          </form>
        )}

        {sent && (
          <button
            onClick={() => setSent(false)}
            className="text-sm text-neutral-500"
          >
            ← Use a different email
          </button>
        )}
      </div>
    </div>
  )
}
