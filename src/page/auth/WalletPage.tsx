import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import AccountSidebar from '../../Components/AccountSidebar'
import { TabTitle } from '../../utils/GeneralFunction'

export default function WalletPage() {
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

  TabTitle('Wallet')

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:py-14">
      <div className="mb-8 flex flex-col justify-between gap-6 border-b border-base-content/15 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-jost text-xs uppercase tracking-[0.25em] text-accent">Account wallet</p>
          <h1 className="mt-3 font-jost text-3xl font-light md:text-4xl">My wallet</h1>
        </div>
        <Link to="/shop" className="btn btn-outline rounded-none font-jost uppercase tracking-widest">
          Shop now
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <AccountSidebar active="wallet" />
        <div className="min-w-0">
          <div className="border border-base-content/15 bg-base-200/40 p-6 sm:p-8">
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
        </div>
      </div>
    </section>
  )
}
