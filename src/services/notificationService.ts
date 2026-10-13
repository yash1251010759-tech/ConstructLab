/**
 * Notification Service
 * Manages user notifications, persistence, and real-time subscription events.
 */

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'circuit';
  timestamp: string;
  read: boolean;
  metadata?: Record<string, any>;
}

type NotificationListener = (notifications: AppNotification[]) => void;

class NotificationManager {
  private listeners: Set<NotificationListener> = new Set();

  private getStorageKey(userId: string): string {
    return `constructlab_notifications_${userId}`;
  }

  public getNotifications(userId?: string | null): AppNotification[] {
    if (!userId) return [];
    try {
      const stored = localStorage.getItem(this.getStorageKey(userId));
      if (!stored) return [];
      return JSON.parse(stored) as AppNotification[];
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage:', e);
      return [];
    }
  }

  public addNotification(
    userId: string,
    notification: {
      title: string;
      message: string;
      type?: 'info' | 'success' | 'warning' | 'circuit';
      metadata?: Record<string, any>;
    }
  ): AppNotification {
    const list = this.getNotifications(userId);
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      timestamp: new Date().toISOString(),
      read: false,
      metadata: notification.metadata,
    };

    const updated = [newNotif, ...list.slice(0, 49)]; // keep latest 50
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save notification to localStorage:', e);
    }

    this.notifyListeners(updated);
    this.dispatchToastEvent(newNotif);
    return newNotif;
  }

  public markAsRead(userId: string, id: string): void {
    const list = this.getNotifications(userId);
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    this.notifyListeners(updated);
  }

  public markAllAsRead(userId: string): void {
    const list = this.getNotifications(userId);
    const updated = list.map((n) => ({ ...n, read: true }));
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    this.notifyListeners(updated);
  }

  public clearAll(userId: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(userId));
    } catch (e) {
      console.warn(e);
    }
    this.notifyListeners([]);
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(notifications: AppNotification[]): void {
    this.listeners.forEach((listener) => {
      try {
        listener(notifications);
      } catch (err) {
        console.error('Notification listener error:', err);
      }
    });
  }

  private dispatchToastEvent(notif: AppNotification): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('constructlab:toast', {
          detail: notif,
        })
      );
    }
  }

  /**
   * Send Welcome Notification if this session hasn't seen one yet
   */
  public sendWelcomeNotification(userId: string, displayName?: string): void {
    const sessionKey = `constructlab_welcomed_${userId}_${new Date().toDateString()}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }
    sessionStorage.setItem(sessionKey, 'true');

    const name = displayName || 'Engineer';
    this.addNotification(userId, {
      title: `Welcome back, ${name}! 👋`,
      message: `Your ConstructLab workspace is active. All circuit designs are linked to your unique ID: ${userId.slice(0, 8)}...`,
      type: 'info',
    });
  }
}

export const notificationService = new NotificationManager();
