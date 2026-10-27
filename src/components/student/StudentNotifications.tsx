import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  ArrowRight,
} from 'lucide-react';

export const StudentNotifications: React.FC = () => {
  const { notifications, dismissNotification, setActiveView } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            In-App Attendance Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time alerts for shortage warnings, session verification, and timetable changes
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
          {notifications.length} Total
        </span>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
            No notifications at this time.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.notificationId}
              className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start justify-between gap-4 transition-all hover:border-slate-300 ${
                !n.read ? 'ring-1 ring-indigo-200 bg-indigo-50/20' : ''
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 p-2 rounded-xl bg-slate-50 shrink-0">
                  {n.type === 'warning' && (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                  {n.type === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                  {n.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center space-x-4 mt-3 text-[11px]">
                    <span className="text-slate-400 font-mono">
                      {new Date(n.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {n.linkTo && (
                      <button
                        onClick={() => setActiveView(n.linkTo!)}
                        className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => dismissNotification(n.notificationId)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
