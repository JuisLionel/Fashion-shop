import { Link } from 'react-router'
import { FiCreditCard, FiUser } from 'react-icons/fi'

type AccountSection = 'profile' | 'orders' | 'wallet' | 'wishlist'

const LINKS = [
  { label: 'Profile settings', to: '/account', section: 'profile', icon: FiUser },
  { label: 'Wallet', to: '/account/wallet', section: 'wallet', icon: FiCreditCard },
 ] as const

export default function AccountSidebar({ active }: { active: AccountSection }) {
  return (
    <nav aria-label="Account" className="h-fit border border-base-content/10 bg-base-100 p-2">
      {LINKS.map(({ label, to, section, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          aria-current={active === section ? 'page' : undefined}
          className={`flex items-center gap-3 px-3 py-3 font-jost text-sm transition-colors ${active === section ? 'bg-accent/10 font-medium text-accent' : 'text-base-content/70 hover:bg-base-200'}`}
        >
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
