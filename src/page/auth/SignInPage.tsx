import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { AuthLayout, EMAIL_PATTERN, Field, FormError, linkClass, SocialAuthButtons, SubmitButton } from './AuthLayout'

import { TabTitle } from '../../utils/GeneralFunction'

export default function SignInPage() {
  const { isSignedIn, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  TabTitle('Sign In | Fashion Shop')

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
