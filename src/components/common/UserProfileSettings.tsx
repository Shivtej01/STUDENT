import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Shield,
  Bell,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Key,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const UserProfileSettings: React.FC = () => {
  const { currentUser, config } = useApp();
  const [notifyShortage, setNotifyShortage] = useState(true);
  const [notifyQrSessions, setNotifyQrSessions] = useState(true);
  const [phone, setPhone] = useState(currentUser.phone || '+1 (555) 234-5678');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          User Profile &amp; Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Identity credentials verified by Amazon Cognito Identity Services
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">User preferences successfully updated.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Card (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col items-center text-center space-y-4">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-50 shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
          )}

          <div>
            <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {currentUser.rollNumber || currentUser.employeeId || currentUser.userId}
            </p>
            <span className="inline-block mt-2 text-xs font-semibold uppercase px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {currentUser.role}
            </span>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 text-left text-xs space-y-2.5 text-slate-600">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{currentUser.departmentName || 'Computer Science & Engineering'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Semester {currentUser.semester} • Section A</span>
            </div>
          </div>
        </div>

        {/* Settings & Cognito Info (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Notification Preferences</h3>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyShortage}
                  onChange={(e) => setNotifyShortage(e.target.checked)}
                  className="rounded accent-indigo-600 w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Attendance Shortage Alerts (&lt; 75%)</span>
                  <span className="text-slate-500 text-[11px]">
                    Receive instant push notices when any course drops below the mandatory examination threshold.
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyQrSessions}
                  onChange={(e) => setNotifyQrSessions(e.target.checked)}
                  className="rounded accent-indigo-600 w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Live Lecture QR Session Alerts</span>
                  <span className="text-slate-500 text-[11px]">
                    Notify when an instructor launches a QR attendance session in your scheduled room.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3 text-xs text-slate-600">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Shield className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">Senate Attendance Regulations</h3>
            </div>
            <p className="text-[11px] leading-relaxed">
              In accordance with Section 14.2 of the Institute Academic Handbook, every student must secure
              a minimum of <strong>75.0% attendance</strong> in each registered course to be eligible for the end-semester examinations.
              Condonation for medical reasons (up to 10%) requires a formal certificate submitted to the Dean of Academic Affairs within 7 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
