import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  X,
} from 'lucide-react';
import { notificationService, AppNotification } from '../../services/notificationService';

interface NotificationDropdownProps {
  userId?: string | null;
  isDarkMode: boolean;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  userId,
  isDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    // Load initial
    setNotifications(notificationService.getNotifications(userId));

    // Subscribe to live updates
    const unsubscribe = notificationService.subscribe((updated) => {
      setNotifications(updated);
    });

    return () => unsubscribe();
  }, [userId]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    if (userId) {
      notificationService.markAllAsRead(userId);
    }
  };

  const handleClearAll = () => {
    if (userId) {
      notificationService.clearAll(userId);
    }
  };

  const handleItemClick = (id: string) => {
    if (userId) {
      notificationService.markAsRead(userId, id);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'circuit':
        return <Cpu className="w-3.5 h-3.5 text-blue-400" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'warning':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg border transition-all ${
          isOpen
            ? 'bg-blue-600 text-white border-blue-500'
            : isDarkMode
            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
        }`}
        title="Notifications"
        aria-label="View Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white ring-2 ring-slate-900 shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100 divide-slate-800'
              : 'bg-white border-slate-200 text-slate-900 divide-slate-100'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-inherit flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-wide uppercase">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                    className="p-1 rounded text-slate-400 hover:text-blue-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                    title="Clear all notifications"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-inherit">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-30 stroke-1" />
                <p className="text-xs font-semibold">No notifications yet</p>
                <p className="text-[11px] text-slate-500">
                  Saving circuits, cloud sync events, and updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`p-3 text-left transition-colors cursor-pointer flex gap-3 items-start ${
                    item.read
                      ? isDarkMode
                        ? 'bg-transparent hover:bg-slate-800/40 opacity-70'
                        : 'bg-transparent hover:bg-slate-50 opacity-75'
                      : isDarkMode
                      ? 'bg-blue-950/20 hover:bg-blue-950/30 border-l-2 border-l-blue-500'
                      : 'bg-blue-50/50 hover:bg-blue-50/80 border-l-2 border-l-blue-500'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs font-bold truncate ${
                          item.read
                            ? isDarkMode
                              ? 'text-slate-300'
                              : 'text-slate-700'
                            : isDarkMode
                            ? 'text-white'
                            : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                  {!item.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          {notifications.length > 0 && (
            <div className={`p-2 text-center text-[10px] font-mono border-t border-inherit ${
              isDarkMode ? 'bg-slate-950/40 text-slate-500' : 'bg-slate-50 text-slate-400'
            }`}>
              Synced live with your Supabase Engineer ID
            </div>
          )}
        </div>
      )}
    </div>
  );
};
