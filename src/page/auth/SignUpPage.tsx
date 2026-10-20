import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { parsePhoneInput, type CountryCode } from '../../auth/phone'
import { useAuth } from '../../auth/useAuth'
import { AuthLayout, EMAIL_PATTERN, Field, FormError, linkClass, PhoneField, SocialAuthButtons, SubmitButton } from './AuthLayout'

import { TabTitle } from '../../utils/GeneralFunction'

export default function SignUpPage() {
  const { isSignedIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    birthDate: '',
    email: '',
    phone: '',
    phoneCountry: 'ID' as CountryCode,
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  TabTitle('Sign Up | Fashion Shop')
  
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

    let phone: string | null
    try {
      phone = form.phone.trim() ? parsePhoneInput(form.phone, form.phoneCountry).number : null
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Enter a valid phone number.')
      return
    }

    setIsSubmitting(true)
    try {
      await signUp({ ...form, phone: phone ?? '' })
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
        <PhoneField
          country={form.phoneCountry}
          value={form.phone}
          onCountryChange={(country) => update('phoneCountry', country)}
          onChange={(value) => update('phone', value)}
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
