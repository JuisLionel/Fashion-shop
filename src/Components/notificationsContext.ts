import { createContext } from 'react'

export type NotificationsContextValue = {
  notifyError: (message: string) => void
  notifySuccess: (message: string) => void
}

export const NotificationsContext = createContext<NotificationsContextValue | null>(null)
