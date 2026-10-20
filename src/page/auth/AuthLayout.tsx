import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { useAuth } from '../../auth/useAuth'
import { PHONE_COUNTRIES, type CountryCode } from '../../auth/phone'
import { FaApple, FaGoogle } from 'react-icons/fa'
import Silk from '../../Components/Silk'

export function AuthLayout({
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

export function Field({ label, hint, type, ...props }: FieldProps) {
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

export function SubmitButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className="w-full cursor-pointer rounded-none bg-base-content py-4 font-jost text-xs uppercase tracking-[0.25em] text-base-100 transition-colors hover:bg-accent hover:text-accent-content disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <p role="alert" aria-live="polite" className="alert alert-error rounded-md px-4 py-3 font-jost text-sm">
      {message}
    </p>
  )
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const linkClass = 'btn btn-outline btn-sm shrink-0 rounded-md border-base-content/20 font-jost normal-case tracking-normal'

export function SocialAuthButtons({ onUnavailable }: { onUnavailable: (provider: string) => void }) {
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

export function PhoneField({
  country,
  value,
  onCountryChange,
  onChange,
}: {
  country: CountryCode
  value: string
  onCountryChange: (country: CountryCode) => void
  onChange: (value: string) => void
}) {
  const inputClass = 'w-full min-w-0 bg-transparent px-3 py-3 font-jost text-sm outline-none'

  return (
    <label className="block">
      <span className="mb-2 block font-jost text-[11px] uppercase tracking-[0.2em] text-base-content/60">
        Mobile number
      </span>
      <span className="flex border border-base-content/20 focus-within:border-accent">
        <select
          aria-label="Phone country code"
          autoComplete="tel-country-code"
          value={country}
          onChange={(event) => onCountryChange(event.target.value as CountryCode)}
          className="w-32 max-w-[42%] shrink-0 border-r border-base-content/15 bg-transparent px-1.5 font-jost text-xs outline-none sm:w-36"
        >
          {PHONE_COUNTRIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name} (+{item.callingCode})
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. 812 3456 7890"
          className={`${inputClass} placeholder:text-base-content/45`}
        />
      </span>
    </label>
  )
}
