import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  History,
  QrCode,
  Calendar,
  Bell,
  Sparkles,
  User,
  Users,
  FileCheck,
  Radio,
  FileSpreadsheet,
  AlertOctagon,
  LineChart,
  Building2,
  GraduationCap,
  ClipboardList,
  ShieldCheck,
  CloudCog,
  ChevronRight,
  Server,
  Database,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenAiAssistant: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  onOpenAiAssistant,
}) => {
  const { currentUser, activeView, setActiveView, lowAttendanceCount, config } = useApp();

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    onCloseMobile();
  };

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-attendance', label: 'My Attendance', icon: CalendarCheck },
    {
      id: 'subject-wise',
      label: 'Subject Breakdown',
      icon: BookOpen,
      badge: lowAttendanceCount > 0 ? `${lowAttendanceCount} Low` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { id: 'history', label: 'Attendance History', icon: History },
    { id: 'qr-scanner', label: 'QR Scanner', icon: QrCode, highlight: true },
    { id: 'timetable', label: 'Weekly Timetable', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai-assistant', label: 'AI Attendance Agent', icon: Sparkles, isAi: true },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  const teacherNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-classes', label: 'My Classes & Roster', icon: Users },
    { id: 'mark-attendance', label: 'Mark Attendance', icon: FileCheck },
    { id: 'qr-session', label: 'Live QR Session', icon: Radio, highlight: true },
    { id: 'reports', label: 'Attendance Reports', icon: FileSpreadsheet },
    { id: 'low-attendance', label: 'Shortage Watchlist', icon: AlertOctagon },
    { id: 'ai-analytics', label: 'AI Class Analytics', icon: Sparkles, isAi: true },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Accounts', icon: GraduationCap },
    { id: 'teachers', label: 'Teacher Accounts', icon: Users },
    { id: 'departments', label: 'Departments & Semesters', icon: Building2 },
    { id: 'subjects', label: 'Subject Management', icon: BookOpen },
    { id: 'enrollments', label: 'Enrollment Matrix', icon: ClipboardList },
    { id: 'monitoring', label: 'Consolidated Reports', icon: LineChart },
    { id: 'audit-logs', label: 'Audit Trail (Logs)', icon: ShieldCheck },
    { id: 'system-settings', label: 'AWS Cloud & System', icon: CloudCog },
  ];

  const navItems =
    currentUser.role === 'student'
      ? studentNav
      : currentUser.role === 'teacher'
      ? teacherNav
      : adminNav;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-50/80 border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:h-[calc(100vh-5.5rem)] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
          {/* User role pill info */}
          <div className="px-3 py-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Portal Mode
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-semibold text-slate-900 capitalize">
                {currentUser.role} Portal
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {currentUser.departmentName || 'Engineering Faculty'}
            </p>
          </div>

          {/* Navigation group */}
          <nav className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'ai-assistant') {
                      onOpenAiAssistant();
                      onCloseMobile();
                    } else {
                      handleNavClick(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : item.highlight
                      ? 'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/70 border border-indigo-200/60 font-semibold'
                      : item.isAi
                      ? 'text-indigo-700 hover:bg-indigo-50/50'
                      : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-white'
                          : item.highlight || item.isAi
                          ? 'text-indigo-600'
                          : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.isAi && !isActive && (
                      <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                    )}
                    {!isActive && !item.badge && !item.isAi && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom AWS & CloudWatch status widget */}
        <div className="p-3 border-t border-slate-200 bg-white/60">
          <div className="p-2.5 rounded-lg bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between text-slate-700 font-semibold text-[10px] uppercase tracking-wider">
              <span className="flex items-center space-x-1">
                <Server className="w-3 h-3 text-amber-600" />
                <span>AWS Serverless</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-indigo-500" />
                <span>DynamoDB Tables</span>
              </span>
              <span className="font-mono">5 Active</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              Region: {config.awsRegion}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
