import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Bell,
  Sparkles,
  Cloud,
  ChevronDown,
  UserCheck,
  Shield,
  BookOpen,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Menu,
  Rocket,
} from 'lucide-react';
import { UserRole } from '../../types/attendance';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  onOpenAiAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  onOpenAiAssistant,
}) => {
  const {
    currentUser,
    switchRole,
    config,
    notifications,
    dismissNotification,
    setActiveView,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setShowRoleDropdown(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Demo Mode / AWS Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            DEMO MODE
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            AWS Cloud Emulation Active
          </span>
          <span className="text-slate-500 hidden md:inline">•</span>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            DynamoDB (On-Demand) • Lambda (Python 3.11) • Cognito Auth • S3 Bucket: {config.s3ReportBucket}
          </span>
        </div>
        <div className="flex items-center space-x-2.5 text-[11px]">
          <button
            onClick={() => setActiveView('aws-deploy')}
            className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] transition-colors shadow-xs"
            title="Open AWS Deployment Guide and scripts"
          >
            <Rocket className="w-3 h-3" />
            <span>Deploy on AWS Guide</span>
          </button>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Role:</span>
          <span className="font-semibold text-white uppercase tracking-wider bg-indigo-600/50 px-2 py-0.5 rounded border border-indigo-400/40">
            {currentUser.role}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Toggle & Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setActiveView('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">SmartAttend</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  {config.institutionName}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Quick Role Switcher Buttons */}
          <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => handleRoleSelect('student')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentUser.role === 'student'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Student (Aarav)</span>
            </button>
            <button
              onClick={() => handleRoleSelect('teacher')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentUser.role === 'teacher'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Teacher (Dr. Reed)</span>
            </button>
            <button
              onClick={() => handleRoleSelect('admin')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentUser.role === 'admin'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin (Dean)</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Gemini AI Assistant Button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200/80 transition-all shadow-sm"
              title="Open Gemini AI Attendance Assistant"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span className="hidden sm:inline">Ask AI Assistant</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-900">Notifications</span>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                        {notifications.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.notificationId}
                          className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start space-x-3 ${
                            !n.read ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {n.type === 'warning' && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                            {n.type === 'success' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                            {n.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <button
                            onClick={() => dismissNotification(n.notificationId)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar / Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 text-left transition-colors"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {currentUser.rollNumber || currentUser.employeeId || currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile / Role Dropdown */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {currentUser.departmentName || 'Engineering'}
                    </span>
                  </div>

                  <div className="py-1">
                    <div className="px-4 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role
                    </div>
                    <button
                      onClick={() => handleRoleSelect('student')}
                      className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between ${
                        currentUser.role === 'student'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>Student View</span>
                      {currentUser.role === 'student' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleRoleSelect('teacher')}
                      className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between ${
                        currentUser.role === 'teacher'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>Teacher View</span>
                      {currentUser.role === 'teacher' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleRoleSelect('admin')}
                      className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between ${
                        currentUser.role === 'admin'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>Administrator View</span>
                      {currentUser.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setActiveView('profile');
                        setShowRoleDropdown(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      Profile & Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
