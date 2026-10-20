import { Link, Navigate } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { TabTitle } from '../../utils/GeneralFunction';

type AccountSection = 'orders' | 'settings' | 'addresses' | 'appointments'

export default function AccountSectionPage({ section, title }: { section: AccountSection; title: string }) {
  const { account } = useAuth()
  if (!account) return <Navigate to="/sign-in" replace />

  const { user } = account
  const entries = section === 'orders'
    ? user.orders
    : section === 'addresses'
      ? user.addresses
      : []
    
  TabTitle(`Account | Fashion Shop`)

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
