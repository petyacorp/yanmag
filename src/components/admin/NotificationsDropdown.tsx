'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, AtSign, CheckCircle2, Info, Check, Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  type Notification 
} from '@/lib/actions/notifications';

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      // Ensure type is matches the enum structure
      setNotifications(data as Notification[]);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial Fetch
    fetchNotifications();

    // 2. Real-time Subscription
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
    };

    setupRealtime();

    // 3. Click outside handler to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsActionPending(true);
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsActionPending(true);
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsActionPending(true);
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionPending(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <AtSign className="w-4 h-4 text-[var(--color-yan-red)]" />;
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays === 1) return 'ayer';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors relative cursor-pointer p-1"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-yan-red)] rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3.5 w-80 bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] shadow-xl z-50 overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--color-yan-border)] flex items-center justify-between bg-[var(--color-yan-surface-elevated)]">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[var(--color-yan-charcoal)] flex items-center gap-2">
              Notificaciones
              {unreadCount > 0 && (
                <span className="bg-[var(--color-yan-red)] text-[var(--color-yan-ivory)] text-[10px] font-sans px-1.5 py-0.5 font-semibold">
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                disabled={isActionPending}
                className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-yan-stone)] hover:text-[var(--color-yan-red)] transition-colors disabled:opacity-50"
              >
                Leer todo
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-72 overflow-y-auto divide-y divide-[var(--color-yan-border-light)]">
            {isLoading ? (
              <div className="py-8 flex items-center justify-center text-[var(--color-yan-stone)]">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-4 flex gap-3 hover:bg-[var(--color-yan-surface-elevated)] transition-colors ${
                    !notif.is_read ? 'bg-[var(--color-yan-surface-elevated)]/40 font-medium' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[var(--color-yan-charcoal)] leading-relaxed break-words">
                      {notif.message}
                    </p>
                    <span className="text-[9px] font-mono text-[var(--color-yan-stone)] uppercase tracking-wider mt-1 block">
                      {formatTime(notif.created_at)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 justify-center">
                    {!notif.is_read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        disabled={isActionPending}
                        className="p-1 hover:text-[var(--color-yan-red)] text-[var(--color-yan-stone)] border border-transparent hover:border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] transition-all"
                        title="Marcar como leída"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteNotification(notif.id, e)}
                      disabled={isActionPending}
                      className="p-1 hover:text-[var(--color-yan-red)] text-[var(--color-yan-stone)] border border-transparent hover:border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] transition-all"
                      title="Eliminar notificación"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-[var(--color-yan-stone)] font-mono text-[11px]">
                No tienes notificaciones pendientes.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
