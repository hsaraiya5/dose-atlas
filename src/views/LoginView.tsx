import { useState } from 'react'

const inputClass =
  'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-base text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500'

export function LoginView({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setStep('code')
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    onLoggedIn()
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
              className="rounded-lg bg-purple-600 text-white font-medium py-2.5 hover:bg-purple-700 transition-colors"
            >
              Send code
            </button>
          </form>
        )}

        {step === 'code' && (
          <form className="flex flex-col gap-3" onSubmit={handleVerify}>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className={inputClass}
              autoFocus
            />
            <button
              type="submit"
              className="rounded-lg bg-purple-600 text-white font-medium py-2.5 hover:bg-purple-700 transition-colors"
            >
              Verify
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
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
