/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { SubjectAttendanceView } from './components/student/SubjectAttendanceView';
import { AttendanceHistoryView } from './components/student/AttendanceHistoryView';
import { StudentQrScanner } from './components/student/StudentQrScanner';
import { StudentTimetable } from './components/student/StudentTimetable';
import { StudentNotifications } from './components/student/StudentNotifications';

// Teacher Views
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TeacherClassRoster } from './components/teacher/TeacherClassRoster';
import { TeacherMarkAttendance } from './components/teacher/TeacherMarkAttendance';
import { TeacherQrSession } from './components/teacher/TeacherQrSession';
import { TeacherReports } from './components/teacher/TeacherReports';
import { TeacherLowAttendance } from './components/teacher/TeacherLowAttendance';
import { TeacherAiAnalytics } from './components/teacher/TeacherAiAnalytics';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminStudents } from './components/admin/AdminStudents';
import { AdminTeachers } from './components/admin/AdminTeachers';
import { AdminDepartments } from './components/admin/AdminDepartments';
import { AdminSubjects } from './components/admin/AdminSubjects';
import { AdminEnrollments } from './components/admin/AdminEnrollments';
import { AdminMonitoring } from './components/admin/AdminMonitoring';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';
import { AdminSystemSettings } from './components/admin/AdminSystemSettings';

// Common & Public Views
import { UserProfileSettings } from './components/common/UserProfileSettings';
import { GeminiAssistantModal } from './components/ai/GeminiAssistantModal';
import { AwsDeploymentHub } from './components/common/AwsDeploymentHub';
import { LoginPage } from './components/public/LoginPage';
import { AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, activeView, setActiveView } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // If user navigates to login
  if (activeView === 'login') {
    return <LoginPage onSuccess={() => setActiveView('dashboard')} />;
  }

  // Render role-appropriate view
  const renderCurrentView = () => {
    // Shared profile
    if (activeView === 'profile') {
      return <UserProfileSettings />;
    }

    // Shared AWS Deployment Guide view
    if (activeView === 'aws-deploy') {
      return <AwsDeploymentHub standalone={true} onClose={() => setActiveView('dashboard')} />;
    }

    // Shared standalone AI assistant view
    if (activeView === 'ai-assistant') {
      return (
        <GeminiAssistantModal
          isOpen={true}
          onClose={() => setActiveView('dashboard')}
          standalone={true}
        />
      );
    }

    // Role: Student
    if (currentUser.role === 'student') {
      switch (activeView) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'my-attendance':
        case 'subject-wise':
          return <SubjectAttendanceView />;
        case 'history':
          return <AttendanceHistoryView />;
        case 'qr-scanner':
          return <StudentQrScanner />;
        case 'timetable':
          return <StudentTimetable />;
        case 'notifications':
          return <StudentNotifications />;
        default:
          return <StudentDashboard />;
      }
    }

    // Role: Teacher
    if (currentUser.role === 'teacher') {
      switch (activeView) {
        case 'dashboard':
          return <TeacherDashboard />;
        case 'my-classes':
          return <TeacherClassRoster />;
        case 'mark-attendance':
          return <TeacherMarkAttendance />;
        case 'qr-session':
          return <TeacherQrSession />;
        case 'reports':
          return <TeacherReports />;
        case 'low-attendance':
          return <TeacherLowAttendance />;
        case 'ai-analytics':
          return <TeacherAiAnalytics />;
        default:
          return <TeacherDashboard />;
      }
    }

    // Role: Admin
    if (currentUser.role === 'admin') {
      switch (activeView) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'students':
          return <AdminStudents />;
        case 'teachers':
          return <AdminTeachers />;
        case 'departments':
          return <AdminDepartments />;
        case 'subjects':
          return <AdminSubjects />;
        case 'enrollments':
          return <AdminEnrollments />;
        case 'monitoring':
          return <AdminMonitoring />;
        case 'audit-logs':
          return <AdminAuditLogs />;
        case 'system-settings':
          return <AdminSystemSettings />;
        default:
          return <AdminDashboard />;
      }
    }

    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Unauthorized or Page Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          You do not have permission to view this section under role &ldquo;{currentUser.role}&rdquo;.
        </p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenAiAssistant={() => setIsAiModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Gemini AI Assistant Drawer */}
      <GeminiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        standalone={false}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
