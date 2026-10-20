import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { FaApple, FaGoogle } from 'react-icons/fa'
import Silk from '../Components/Silk'

function AuthLayout({
  children,
  title,
  subtitle,
  footer,
}: {
  children: ReactNode
  title: string
  subtitle: string
  footer: ReactNode
}) {
  const { storageError } = useAuth()

  return (
    <section className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
      <aside className="relative flex min-h-72 flex-col justify-end overflow-hidden bg-neutral p-8 text-neutral-content sm:p-12 lg:min-h-0">
        <div className="absolute inset-0">
          <Silk
            color="#8A6A3B"
            sheenColor="#E5D5B8"
            speed={5}
            scale={1}
            rotation={0}
            sheen={0.42}
            depth={0.62}
            glow={0.24}
            noiseIntensity={0.8}
            mouseInteraction
            clickRipple
            intro
            ripple={1}
            wave={1}
            variation={0}
            interactionStrength={1}
            fade={0}
            lightMode={false}
          />
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full border border-neutral-content/10" />
        <div className="pointer-events-none absolute -right-8 -top-8 size-96 rounded-full border border-neutral-content/10" />

        <div className="relative z-10">
          <h2 className="mt-4 max-w-sm font-jost text-4xl font-light leading-tight xl:text-5xl">
            Your style, kept in one place.
          </h2>
        </div>
      </aside>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-10 md:py-14">
        <div className="w-full max-w-md">
          <p className="font-jost text-xs uppercase tracking-[0.25em] text-accent lg:hidden">
            Fashion Shop
          </p>
          <h1 className="mt-3 font-jost text-4xl font-light lg:mt-0">{title}</h1>
          <p className="mt-3 font-jost text-sm text-base-content/60">{subtitle}</p>

          {storageError && (
            <p role="alert" className="mt-6 border-l-2 border-error pl-3 font-jost text-sm text-error">
              {storageError}
            </p>
          )}

          <div className="mt-10">{children}</div>
          <p className="mt-10 flex items-center justify-between gap-4 border-t border-base-content/10 pt-6 font-jost text-sm text-base-content/60">
            {footer}
          </p>
        </div>
      </div>
    </section>
  )
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
}

function Field({ label, hint, type, ...props }: FieldProps) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <label className="block">
      <span className="flex items-baseline justify-between font-jost text-[11px] uppercase tracking-[0.2em] text-base-content/60">
        {label}
        {hint && <span className="normal-case tracking-normal text-base-content/40">{hint}</span>}
      </span>
      <span className="relative block">
        <input
          {...props}
          type={isPassword && show ? 'text' : type}
          className="w-full rounded-none border-b border-base-content/25 bg-transparent py-3 pr-14 font-jost text-base outline-none transition-colors placeholder:text-base-content/30 focus:border-accent"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            className="absolute right-0 top-1/2 -translate-y-1/2 font-jost text-[11px] uppercase tracking-widest text-base-content/50 transition-colors hover:text-accent"
          >
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </span>
    </label>
  )
}

function SubmitButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className="w-full cursor-pointer rounded-none bg-base-content py-4 font-jost text-xs uppercase tracking-[0.25em] text-base-100 transition-colors hover:bg-accent hover:text-accent-content disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  )
}

function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <p role="alert" aria-live="polite" className="alert alert-error rounded-md px-4 py-3 font-jost text-sm">
      {message}
    </p>
  )
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const linkClass = 'btn btn-outline btn-sm shrink-0 rounded-md border-base-content/20 font-jost normal-case tracking-normal'

function SocialAuthButtons({ onUnavailable }: { onUnavailable: (provider: string) => void }) {
  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-4 font-jost text-[10px] uppercase tracking-[0.2em] text-base-content/40"><span className="h-px flex-1 bg-base-content/10" />Or continue with<span className="h-px flex-1 bg-base-content/10" /></div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onUnavailable('Google')} className="btn btn-outline rounded-none border-base-content/20 font-jost normal-case"><FaGoogle aria-hidden="true" className="text-[#4285F4]" />Google</button>
        <button type="button" onClick={() => onUnavailable('Apple')} className="btn btn-outline rounded-none border-base-content/20 font-jost normal-case"><FaApple aria-hidden="true" />Apple</button>
      </div>
    </div>
  )
}

export function SignInPage() {
  const { isSignedIn, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isSignedIn) return <Navigate to="/" replace />

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Enter a valid email address, such as name@example.com.')
      return
    }
    setIsSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back. Sign in to your Fashion Shop account."
      footer={
        <>
          New here? <Link to="/sign-up" className={linkClass}>Create an account</Link>
        </>
      }
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-7">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <FormError message={error} />
        <SubmitButton disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</SubmitButton>
      </form>
      <SocialAuthButtons onUnavailable={(provider) => setError(`${provider} sign-in is not configured yet. Connect a secure OAuth provider to enable it.`)} />
    </AuthLayout>
  )
}

export function SignUpPage() {
  const { isSignedIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    birthDate: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isSignedIn) return <Navigate to="/account" replace />

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!form.username.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError('Complete the username, email, and password fields.')
      return
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setError('Enter a valid email address, such as name@example.com.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Your password must be at least 8 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      await signUp(form)
      navigate('/account')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create the account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join Fashion Shop. It only takes a minute."
      footer={
        <>
          Already registered? <Link to="/sign-in" className={linkClass}>Sign in</Link>
        </>
      }
    >
      <form noValidate onSubmit={submit} className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
        <Field
          label="Username"
          autoComplete="username"
          required
          value={form.username}
          onChange={(event) => update('username', event.target.value)}
        />
        <Field
          label="Full name"
          hint="Optional"
          autoComplete="name"
          value={form.fullName}
          onChange={(event) => update('fullName', event.target.value)}
        />
        <div className="sm:col-span-2">
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
          />
        </div>
        <Field
          label="Birth date"
          hint="Optional"
          type="date"
          autoComplete="bday"
          value={form.birthDate}
          onChange={(event) => update('birthDate', event.target.value)}
        />
        <Field
          label="Phone"
          hint="Optional"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={(event) => update('phone', event.target.value)}
        />
        <Field
          label="Password"
          hint="Min. 8 characters"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={form.password}
          onChange={(event) => update('password', event.target.value)}
        />
        <Field
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={form.confirmPassword}
          onChange={(event) => update('confirmPassword', event.target.value)}
        />

        <div className="flex flex-col gap-7 sm:col-span-2">
          <FormError message={error} />
          <SubmitButton disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </SubmitButton>
        </div>
      </form>
      <SocialAuthButtons onUnavailable={(provider) => setError(`${provider} sign-up is not configured yet. Connect a secure OAuth provider to enable it.`)} />
    </AuthLayout>
  )
}

export function AccountPage() {
  const { account, signOut } = useAuth()
  if (!account) return <Navigate to="/sign-in" replace />

  const { profile } = account.user

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-jost text-xs uppercase tracking-[0.25em] text-accent">My account</p>
          <h1 className="mt-3 font-jost text-3xl font-light md:text-4xl">
            Welcome, {profile.full_name || profile.username}
          </h1>
        </div>
        <button onClick={() => { signOut(); window.location.assign('/') }} className="btn btn-outline rounded-none font-jost uppercase tracking-widest">
          Sign out
        </button>
      </div>

      <dl className="mt-10 grid gap-5 border-t border-base-300 pt-6 sm:grid-cols-2">
        <div>
          <dt className="font-jost text-xs uppercase tracking-wider text-base-content/60">Username</dt>
          <dd className="mt-1 font-jost">{profile.username}</dd>
        </div>
        <div>
          <dt className="font-jost text-xs uppercase tracking-wider text-base-content/60">Email</dt>
          <dd className="mt-1 font-jost">{account.user.contact.email}</dd>
        </div>
        <div>
          <dt className="font-jost text-xs uppercase tracking-wider text-base-content/60">Full name</dt>
          <dd className="mt-1 font-jost">{profile.full_name || 'Not provided'}</dd>
        </div>
        <div>
          <dt className="font-jost text-xs uppercase tracking-wider text-base-content/60">Birth date</dt>
          <dd className="mt-1 font-jost">{profile.birth_date || 'Not provided'}</dd>
        </div>
      </dl>
    </section>
  )
}

type AccountSection = 'orders' | 'settings' | 'addresses' | 'appointments'

export function AccountSectionPage({ section, title }: { section: AccountSection; title: string }) {
  const { account } = useAuth()
  if (!account) return <Navigate to="/sign-in" replace />

  const { user } = account
  const entries = section === 'orders'
    ? user.orders
    : section === 'addresses'
      ? user.addresses
      : []

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <Link to="/account" className="font-jost text-sm underline underline-offset-4 hover:text-accent">
        My account
      </Link>
      <h1 className="mt-5 font-jost text-3xl font-light md:text-4xl">{title}</h1>

      {section === 'settings' ? (
        <dl className="mt-8 grid gap-5 border-t border-base-300 pt-6 sm:grid-cols-2">
          <div>
            <dt className="font-jost text-xs uppercase tracking-wider text-base-content/60">Username</dt>
            <dd className="mt-1 font-jost">{user.profile.username}</dd>
          </div>
          <div>
            <dt className="font-jost text-xs uppercase tracking-wider text-base-content/60">Full name</dt>
            <dd className="mt-1 font-jost">{user.profile.full_name || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="font-jost text-xs uppercase tracking-wider text-base-content/60">Email</dt>
            <dd className="mt-1 font-jost">{user.contact.email}</dd>
          </div>
          <div>
            <dt className="font-jost text-xs uppercase tracking-wider text-base-content/60">Phone</dt>
            <dd className="mt-1 font-jost">{user.contact.phone || 'Not provided'}</dd>
          </div>
        </dl>
      ) : entries.length > 0 ? (
        <ul className="mt-8 divide-y divide-base-300 border-y border-base-300">
          {entries.map((entry, index) => (
            <li key={index} className="py-4 font-jost">{JSON.stringify(entry)}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 border-t border-base-300 pt-6 font-jost text-base-content/70">
          Nothing here yet.
        </p>
      )}
    </section>
  )
}

export function WalletPage() {
  const { account, topUpWallet } = useAuth()
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('100000')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  if (!account) return <Navigate to="/sign-in" replace />

  const presetAmounts = [50_000, 100_000, 250_000, 500_000]
  const amount = Number(topUpAmount)
  const transactions = [...account.user.wallet.transactions]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))

  const submitTopUp = () => {
    try {
      topUpWallet(amount)
      setMessage(`Added Rp ${amount.toLocaleString('id-ID')} to your wallet.`)
      setError('')
      setIsTopUpOpen(false)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not top up your wallet.')
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-20">
      <Link to="/account" className="font-jost text-sm underline underline-offset-4 hover:text-accent">
        My account
      </Link>
      <div className="mt-6 flex flex-col justify-between gap-6 border-b border-base-300 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-jost text-xs uppercase tracking-[0.25em] text-accent">Account wallet</p>
          <h1 className="mt-3 font-jost text-3xl font-light md:text-4xl">My wallet</h1>
        </div>
        <Link to="/shop" className="btn btn-outline rounded-none font-jost uppercase tracking-widest">
          Shop now
        </Link>
      </div>

      <div className="mt-8 border border-base-content/15 bg-base-200/40 p-6 sm:p-8">
        <p className="font-jost text-xs uppercase tracking-[0.2em] text-base-content/60">Available balance</p>
        <p className="mt-3 font-jost text-4xl font-light sm:text-5xl">
          Rp {account.user.wallet.balance.toLocaleString('id-ID')}
        </p>
        <button
          type="button"
          onClick={() => { setIsTopUpOpen((open) => !open); setMessage(''); setError('') }}
          className="btn btn-neutral mt-6 rounded-none font-jost uppercase tracking-widest"
        >
          {isTopUpOpen ? 'Cancel top up' : 'Top up'}
        </button>
      </div>

      {isTopUpOpen && (
        <section className="mt-6 border border-base-content/15 p-6" aria-labelledby="wallet-top-up-title">
          <h2 id="wallet-top-up-title" className="font-jost text-lg font-medium">Choose or enter an amount</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {presetAmounts.map((presetAmount) => (
              <button
                key={presetAmount}
                type="button"
                aria-pressed={topUpAmount === String(presetAmount)}
                onClick={() => setTopUpAmount(String(presetAmount))}
                className={`btn rounded-none font-jost ${topUpAmount === String(presetAmount) ? 'btn-neutral' : 'btn-outline'}`}
              >
                Rp {presetAmount.toLocaleString('id-ID')}
              </button>
            ))}
          </div>
          <label htmlFor="wallet-top-up-amount" className="mt-5 block font-jost text-sm font-medium">
            Custom amount (IDR)
          </label>
          <div className="mt-2 flex max-w-md items-center border border-base-content/20">
            <span className="px-3 font-jost text-sm text-base-content/60">Rp</span>
            <input
              id="wallet-top-up-amount"
              type="number"
              inputMode="numeric"
              min="1"
              max={Number.MAX_SAFE_INTEGER - account.user.wallet.balance}
              step="1"
              value={topUpAmount}
              onChange={(event) => setTopUpAmount(event.target.value)}
              className="min-w-0 flex-1 bg-transparent px-3 py-3 font-jost text-sm outline-none"
              aria-describedby="wallet-top-up-note"
            />
          </div>
          <p id="wallet-top-up-note" className="mt-4 font-jost text-xs text-base-content/60">
            Wallet credit is added immediately; payment processing is not connected.
          </p>
          {error && <p role="alert" className="mt-3 font-jost text-sm text-error">{error}</p>}
          <button type="button" onClick={submitTopUp} className="btn btn-neutral mt-4 rounded-none font-jost">
            Add Rp {Number.isSafeInteger(amount) && amount > 0 ? amount.toLocaleString('id-ID') : '—'}
          </button>
        </section>
      )}
      {message && <p role="status" className="mt-4 font-jost text-sm text-success">{message}</p>}

      <div className="mt-10">
        <h2 className="font-jost text-xl font-medium">Recent activity</h2>
        {transactions.length > 0 ? (
          <ul className="mt-4 divide-y divide-base-300 border-y border-base-300">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="flex flex-wrap items-center justify-between gap-3 py-4 font-jost">
                <div>
                  <p className="text-sm font-medium">{transaction.description}</p>
                  <p className="mt-1 text-xs text-base-content/60">
                    {new Date(transaction.createdAt).toLocaleString()}
                    {transaction.orderId && <> · <Link to={`/orders/${encodeURIComponent(transaction.orderId)}`} className="underline">View order</Link></>}
                  </p>
                </div>
                <p className={`text-sm font-medium ${transaction.type === 'credit' ? 'text-success' : ''}`}>
                  {transaction.type === 'credit' ? '+' : '−'} Rp {transaction.amount.toLocaleString('id-ID')}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 border-y border-base-300 py-6 font-jost text-sm text-base-content/65">
            No wallet activity yet.
          </p>
        )}
      </div>
    </section>
  )
}
