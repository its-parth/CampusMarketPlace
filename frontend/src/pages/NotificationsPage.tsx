import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NotificationItem } from '../types';
import { Bell, CheckCheck, Loader2, MessageSquare, ShieldCheck, ShoppingBag } from 'lucide-react';
import api from '../services/api';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-brand-600" />
          <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200"
        >
          <CheckCheck className="w-4 h-4" /> Mark All as Read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-3">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No notifications yet</h3>
          <p className="text-xs text-slate-500">You're all caught up! Updates regarding chat messages, transaction offers, and student verification will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-subtle">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start gap-4 transition-colors ${!item.is_read ? 'bg-brand-50/40 font-medium' : 'bg-white'}`}
            >
              <div className={`p-2.5 rounded-xl text-white shrink-0 ${item.type === 'CHAT' ? 'bg-brand-600' : item.type === 'TRANSACTION' ? 'bg-emerald-600' : 'bg-amber-500'}`}>
                {item.type === 'CHAT' ? <MessageSquare className="w-4 h-4" /> : item.type === 'TRANSACTION' ? <ShoppingBag className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                {item.link && (
                  <Link to={item.link} className="inline-block mt-2 text-xs font-bold text-brand-600 hover:underline">
                    View Details →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
