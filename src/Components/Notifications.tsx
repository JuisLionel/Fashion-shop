import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { FiX } from 'react-icons/fi'
import { NotificationsContext } from './notificationsContext'

type Notification = {
  id: number
  message: string
  type: 'error' | 'success'
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Map<number, number>())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer !== undefined) window.clearTimeout(timer)
    timers.current.delete(id)
    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }, [])

  const notify = useCallback((message: string, type: Notification['type']) => {
    const id = nextId.current++
    setNotifications((current) => [...current, { id, message, type }])
    timers.current.set(id, window.setTimeout(() => dismiss(id), 5000))
  }, [dismiss])

  const notifyError = useCallback((message: string) => notify(message, 'error'), [notify])
  const notifySuccess = useCallback((message: string) => notify(message, 'success'), [notify])

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current.clear()
  }, [])

  return (
    <NotificationsContext.Provider value={{ notifyError, notifySuccess }}>
      {children}
      <div className="toast toast-end toast-bottom z-[100] max-sm:bottom-4 max-sm:right-3" aria-live="polite">
        {notifications.map(({ id, message, type }) => (
          <div key={id} role="alert" className={`alert alert-${type} flex max-w-sm items-start gap-3 rounded-none shadow-lg`}>
            <span className="min-w-0 flex-1 font-jost text-sm">{message}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(id)}
              className="btn btn-ghost btn-xs shrink-0"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  )
}
