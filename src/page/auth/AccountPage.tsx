import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { FiLogOut } from 'react-icons/fi'
import { getPhoneInput, parsePhoneInput, type CountryCode } from '../../auth/phone'
import { useAuth } from '../../auth/useAuth'
import AccountSidebar from '../../Components/AccountSidebar'
import { PhoneField } from './AuthLayout'
import { TabTitle } from '../../utils/GeneralFunction'

export default function AccountPage() {
  const { account, signOut, updateProfile, changePassword } = useAuth()
  const [firstName, setFirstName] = useState(() => account?.user.profile.full_name?.trim().split(/\s+/)[0] ?? '')
  const [lastName, setLastName] = useState(() => account?.user.profile.full_name?.trim().split(/\s+/).slice(1).join(' ') ?? '')
  const [username, setUsername] = useState(() => account?.user.profile.username ?? '')
  const [email, setEmail] = useState(() => account?.user.contact.email ?? '')
  const [birthDate, setBirthDate] = useState(() => account?.user.profile.birth_date ?? '')
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>(() => getPhoneInput(account?.user.contact.phone ?? null).country)
  const [phone, setPhone] = useState(() => getPhoneInput(account?.user.contact.phone ?? null).nationalNumber)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  if (!account) return <Navigate to="/sign-in" replace />

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const normalizedPhone = phone.trim() ? parsePhoneInput(phone, phoneCountry).number : ''
      updateProfile({
        username,
        fullName: [firstName.trim(), lastName.trim()].filter(Boolean).join(' '),
        birthDate,
        email,
        phone: normalizedPhone,
      })
      setPhone(normalizedPhone ? getPhoneInput(normalizedPhone, phoneCountry).nationalNumber : '')
      setMessage('Your profile details have been saved.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save your profile.')
    }
  }

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordMessage('')
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Your new passwords do not match.')
      return
    }

    setIsChangingPassword(true)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setPasswordMessage('Your password has been changed.')
    } catch (reason) {
      setPasswordError(reason instanceof Error ? reason.message : 'Could not change your password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  TabTitle('Account settings')

  const inputClass = 'mt-1.5 w-full border border-base-content/15 bg-base-100 px-3 py-3 font-jost text-sm outline-none transition-colors placeholder:text-base-content/35 focus:border-accent'
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:py-14">
      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-base-content/10 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-jost text-xs uppercase tracking-[0.25em] text-accent">My account</p>
          <h1 className="mt-2 font-jost text-3xl font-light md:text-4xl">Account settings</h1>
          <p className="mt-2 font-jost text-sm text-base-content/60">
            Welcome, {account.user.profile.full_name || account.user.profile.username}
          </p>
        </div>
        <button type="button" onClick={() => { signOut(); window.location.assign('/') }} className="btn btn-outline btn-sm rounded-none font-jost uppercase tracking-widest">
          <FiLogOut aria-hidden="true" />
          Sign out
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <AccountSidebar active="profile" />

        <div className="space-y-5">
        <section className="border border-base-content/10 bg-base-100 p-5 sm:p-8" aria-labelledby="profile-settings-heading">
          <h2 id="profile-settings-heading" className="font-jost text-xl font-medium">Profile settings</h2>
          <form onSubmit={saveProfile} className="mt-7 grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <label className="block font-jost text-xs">
              First name
              <input className={inputClass} autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </label>
            <label className="block font-jost text-xs">
              Last name
              <input className={inputClass} autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </label>
            <label className="block font-jost text-xs">
              Username
              <input className={inputClass} autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} />
            </label>
            <label className="block font-jost text-xs">
              Email
              <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <div className="grid gap-5 sm:col-span-2 sm:grid-cols-2">
              <PhoneField
                country={phoneCountry}
                value={phone}
                onCountryChange={setPhoneCountry}
                onChange={setPhone}
              />
              <label className="block font-jost text-xs">
                Birth date
                <input
                  className={inputClass}
                  type="date"
                  autoComplete="bday"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                />
              </label>
            </div>
            {error && <p role="alert" className="font-jost text-sm text-error sm:col-span-2">{error}</p>}
            {message && <p role="status" className="font-jost text-sm text-success sm:col-span-2">{message}</p>}
            <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
              <button type="submit" className="btn btn-neutral rounded-none px-8 font-jost normal-case">Save changes</button>
            </div>
          </form>
        </section>
        <section className="border border-base-content/10 bg-base-100 p-5 sm:p-8" aria-labelledby="change-password-heading">
          <h2 id="change-password-heading" className="font-jost text-xl font-medium">Change password</h2>
          <p className="mt-1 font-jost text-sm text-base-content/55">Enter your current password and choose a new one.</p>
          <form onSubmit={savePassword} className="mt-7 grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <label className="block font-jost text-xs sm:col-span-2">
              Current password
              <input
                className={inputClass}
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>
            <label className="block font-jost text-xs">
              New password
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>
            <label className="block font-jost text-xs">
              Confirm new password
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
              />
            </label>
            {passwordError && <p role="alert" className="font-jost text-sm text-error sm:col-span-2">{passwordError}</p>}
            {passwordMessage && <p role="status" className="font-jost text-sm text-success sm:col-span-2">{passwordMessage}</p>}
            <div className="sm:col-span-2">
              <button type="submit" disabled={isChangingPassword} className="btn btn-neutral rounded-none px-8 font-jost normal-case disabled:cursor-not-allowed disabled:opacity-50">
                {isChangingPassword ? 'Changing password…' : 'Change password'}
              </button>
            </div>
          </form>
        </section>
        </div>
      </div>
    </section>
  )
}
