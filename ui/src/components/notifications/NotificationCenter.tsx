import { useState } from 'react'
import { Bell, X, AlertCircle, AlertTriangle, Info, CheckCircle2, Settings } from 'lucide-react'
import { useNotificationsStore, type NotificationType } from '@/stores/notifications'
import { SeveritySettings } from '@/components/settings'
import { cn } from '@/lib/utils'

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diffSec = Math.floor((now - timestamp) / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  return new Date(timestamp).toLocaleDateString()
}

const typeConfig: Record<NotificationType, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: 'text-blue-400' },
  success: { icon: CheckCircle2, color: 'text-green-400' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400' },
  error: { icon: AlertCircle, color: 'text-red-400' },
}

type Tab = 'notifications' | 'settings'

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('notifications')
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } =
    useNotificationsStore()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
      >
        <Bell className="h-5 w-5 text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-[10px] font-bold bg-error text-white rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 max-h-[28rem] overflow-hidden rounded-lg border border-border-subtle bg-bg-secondary shadow-xl z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    activeTab === 'notifications'
                      ? 'text-accent-primary'
                      : 'text-text-tertiary hover:text-text-secondary'
                  )}
                >
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={cn(
                    'flex items-center gap-1 text-sm font-medium transition-colors',
                    activeTab === 'settings'
                      ? 'text-accent-primary'
                      : 'text-text-tertiary hover:text-text-secondary'
                  )}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </button>
              </div>
              {activeTab === 'notifications' && (
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-accent-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-text-tertiary hover:text-text-secondary"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            {activeTab === 'settings' ? (
              <div className="p-4">
                <SeveritySettings />
              </div>
            ) : (
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-text-tertiary">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const config = typeConfig[notification.type]
                  const Icon = config.icon

                  return (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        'px-4 py-3 border-b border-border-subtle last:border-b-0 cursor-pointer hover:bg-bg-tertiary transition-colors',
                        !notification.read && 'bg-accent-primary/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', config.color)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm truncate">
                              {notification.title}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                              className="text-text-tertiary hover:text-text-secondary shrink-0"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {notification.message && (
                            <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-text-tertiary mt-1">
                            {formatRelativeTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
