import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Department,
  Subject,
  Enrollment,
  AttendanceSession,
  AttendanceRecord,
  AuditLog,
  TimetableSlot,
  AppNotification,
  SystemConfig,
  StudentAttendanceSummary,
  AttendanceStatus,
} from '../types/attendance';
import {
  initialConfig,
  initialDepartments,
  initialUsers,
  initialSubjects,
  initialEnrollments,
  initialSessions,
  initialAttendanceRecords,
  initialAuditLogs,
  initialTimetable,
  initialNotifications,
} from '../data/mockData';
import {
  calculateAttendancePercentage,
  calculateFutureClassesNeeded,
  calculateBunkAllowance,
} from '../utils/attendanceCalculator';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => void;

  // Data collections
  departments: Department[];
  users: User[];
  subjects: Subject[];
  enrollments: Enrollment[];
  sessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  auditLogs: AuditLog[];
  timetable: TimetableSlot[];
  notifications: AppNotification[];

  // Computed properties
  studentSummaries: StudentAttendanceSummary[];
  overallAttendancePercentage: number;
  totalClassesHeld: number;
  totalClassesAttended: number;
  lowAttendanceCount: number;

  // Actions
  markAttendance: (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    notes?: string,
    actorId?: string
  ) => void;
  createSession: (session: Omit<AttendanceSession, 'sessionId'>) => AttendanceSession;
  completeSession: (sessionId: string) => void;
  verifyQrAttendance: (token: string, studentId: string) => Promise<{ success: boolean; message: string }>;
  addUser: (userData: Omit<User, 'userId'>) => User;
  updateUserStatus: (userId: string, status: 'active' | 'inactive') => void;
  addSubject: (subjectData: Omit<Subject, 'subjectId'>) => Subject;
  enrollStudentInSubject: (studentId: string, subjectId: string) => void;
  dismissNotification: (id: string) => void;
  exportAttendanceCsv: (subjectId?: string) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('smartattend_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return initialUsers[0]; // Aarav Sharma (student)
  });

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [config, setConfig] = useState<SystemConfig>(initialConfig);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
  const [sessions, setSessions] = useState<AttendanceSession[]>(initialSessions);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [timetable] = useState<TimetableSlot[]>(initialTimetable);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  useEffect(() => {
    localStorage.setItem('smartattend_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Switch demo user by role
  const switchRole = (role: UserRole) => {
    const match = users.find((u) => u.role === role);
    if (match) {
      setCurrentUser(match);
      setActiveView('dashboard');
    }
  };

  // Compute student attendance summary for currentUser if student
  const studentSummaries: StudentAttendanceSummary[] = React.useMemo(() => {
    if (currentUser.role !== 'student') return [];

    const enrolledSubIds = enrollments
      .filter((e) => e.studentId === currentUser.userId && e.enrollmentStatus === 'enrolled')
      .map((e) => e.subjectId);

    const relevantSubjects = subjects.filter((s) => enrolledSubIds.includes(s.subjectId));

    return relevantSubjects.map((sub) => {
      const records = attendanceRecords.filter(
        (r) => r.studentId === currentUser.userId && r.subjectId === sub.subjectId
      );

      const totalHeld = records.length;
      const attended = records.filter((r) => r.attendanceStatus === 'present' || r.attendanceStatus === 'late').length;
      const late = records.filter((r) => r.attendanceStatus === 'late').length;
      const absent = records.filter((r) => r.attendanceStatus === 'absent').length;
      const percentage = calculateAttendancePercentage(attended, totalHeld);
      const threshold = sub.threshold || config.defaultThresholdPercentage;
      const isLow = percentage < threshold;

      const targetCalc = calculateFutureClassesNeeded(attended, totalHeld, threshold);
      const bunkCalc = calculateBunkAllowance(attended, totalHeld, threshold);

      return {
        subject: sub,
        totalHeld,
        attended,
        absent,
        late,
        percentage,
        threshold,
        isLow,
        classesNeededForTarget: targetCalc.classesNeeded,
        classesCanMiss: bunkCalc.classesCanMiss,
      };
    });
  }, [currentUser, enrollments, subjects, attendanceRecords, config.defaultThresholdPercentage]);

  // Overall student stats
  const totalClassesHeld = React.useMemo(
    () => studentSummaries.reduce((sum, s) => sum + s.totalHeld, 0),
    [studentSummaries]
  );

  const totalClassesAttended = React.useMemo(
    () => studentSummaries.reduce((sum, s) => sum + s.attended, 0),
    [studentSummaries]
  );

  const overallAttendancePercentage = React.useMemo(
    () => calculateAttendancePercentage(totalClassesAttended, totalClassesHeld),
    [totalClassesAttended, totalClassesHeld]
  );

  const lowAttendanceCount = React.useMemo(
    () => studentSummaries.filter((s) => s.isLow).length,
    [studentSummaries]
  );

  // Update Config
  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      if (newConfig.defaultThresholdPercentage && newConfig.defaultThresholdPercentage !== prev.defaultThresholdPercentage) {
        // Log audit event
        const newLog: AuditLog = {
          auditId: `audit-${Date.now()}`,
          actorId: currentUser.userId,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: 'UPDATE_THRESHOLD',
          entityType: 'SETTING',
          entityId: 'threshold_percentage',
          timestamp: new Date().toISOString(),
          reason: `Threshold updated to ${newConfig.defaultThresholdPercentage}% by ${currentUser.name}`,
          previousValue: `${prev.defaultThresholdPercentage}%`,
          newValue: `${newConfig.defaultThresholdPercentage}%`,
        };
        setAuditLogs((l) => [newLog, ...l]);
      }
      return updated;
    });
  };

  // Mark / Update Attendance
  const markAttendance = (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    notes?: string,
    actorId?: string
  ) => {
    const session = sessions.find((s) => s.sessionId === sessionId);
    const student = users.find((u) => u.userId === studentId);
    const existingIndex = attendanceRecords.findIndex(
      (r) => r.sessionId === sessionId && r.studentId === studentId
    );

    const now = new Date().toISOString();
    let oldStatus = 'none';

    if (existingIndex >= 0) {
      oldStatus = attendanceRecords[existingIndex].attendanceStatus;
      const updated = [...attendanceRecords];
      updated[existingIndex] = {
        ...updated[existingIndex],
        attendanceStatus: status,
        updatedAt: now,
        notes: notes || updated[existingIndex].notes,
      };
      setAttendanceRecords(updated);
    } else {
      const newRecord: AttendanceRecord = {
        recordId: `rec-${sessionId}-${studentId}`,
        sessionId,
        studentId,
        studentName: student?.name,
        rollNumber: student?.rollNumber,
        subjectId: session?.subjectId || '',
        subjectCode: session?.subjectCode,
        subjectName: session?.subjectName,
        sessionDate: session?.sessionDate || now.split('T')[0],
        sessionTime: `${session?.startTime || '09:00'} - ${session?.endTime || '10:00'}`,
        attendanceStatus: status,
        markedAt: now,
        markedBy: currentUser.role === 'teacher' ? 'teacher' : 'admin_audit',
        notes,
      };
      setAttendanceRecords((prev) => [newRecord, ...prev]);
    }

    // Add Audit Log
    const audit: AuditLog = {
      auditId: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      actorId: actorId || currentUser.userId,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'UPDATE_ATTENDANCE',
      entityType: 'ATTENDANCE_RECORD',
      entityId: `${sessionId}#${studentId}`,
      timestamp: now,
      reason: notes || `Attendance status changed to ${status}`,
      previousValue: oldStatus,
      newValue: status,
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  // Create Session
  const createSession = (sessionData: Omit<AttendanceSession, 'sessionId'>) => {
    const newSessionId = `sess-${Date.now()}`;
    const newSession: AttendanceSession = {
      ...sessionData,
      sessionId: newSessionId,
    };
    setSessions((prev) => [newSession, ...prev]);

    // Audit log
    setAuditLogs((prev) => [
      {
        auditId: `audit-${Date.now()}`,
        actorId: currentUser.userId,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'CREATE_SESSION',
        entityType: 'SESSION',
        entityId: newSessionId,
        timestamp: new Date().toISOString(),
        reason: `New attendance session created for ${sessionData.subjectCode} (${sessionData.sessionType.toUpperCase()})`,
        newValue: 'active',
      },
      ...prev,
    ]);

    return newSession;
  };

  // Complete Session
  const completeSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.sessionId === sessionId ? { ...s, sessionStatus: 'completed' } : s))
    );
  };

  // Verify QR Token
  const verifyQrAttendance = async (token: string, studentId: string) => {
    try {
      const student = users.find((u) => u.userId === studentId);
      const res = await fetch('/api/sessions/validate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          studentId,
          studentName: student?.name,
          rollNumber: student?.rollNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to verify QR code' };
      }

      // Record in local state as well
      const sessionId = data.sessionId;
      const session = sessions.find((s) => s.sessionId === sessionId);

      const existing = attendanceRecords.find(
        (r) => r.sessionId === sessionId && r.studentId === studentId
      );

      if (!existing) {
        const newRecord: AttendanceRecord = {
          recordId: `rec-${sessionId}-${studentId}`,
          sessionId,
          studentId,
          studentName: student?.name,
          rollNumber: student?.rollNumber,
          subjectId: session?.subjectId || 'sub-cs301',
          subjectCode: session?.subjectCode || 'CS-301',
          subjectName: session?.subjectName || 'Data Structures & Algorithms',
          sessionDate: session?.sessionDate || new Date().toISOString().split('T')[0],
          sessionTime: `${session?.startTime || '09:00'} - ${session?.endTime || '10:00'}`,
          attendanceStatus: 'present',
          markedAt: new Date().toISOString(),
          markedBy: 'student_qr',
        };
        setAttendanceRecords((prev) => [newRecord, ...prev]);

        // Add Notification
        setNotifications((prev) => [
          {
            notificationId: `notif-${Date.now()}`,
            userId: studentId,
            title: 'Attendance Recorded via QR',
            message: `Presence successfully marked for ${session?.subjectName || 'class'}. Verified in DynamoDB.`,
            type: 'success',
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      }

      return { success: true, message: data.message || 'Attendance verified successfully!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Network error: ${msg}` };
    }
  };

  // Add User
  const addUser = (userData: Omit<User, 'userId'>) => {
    const newUser: User = {
      ...userData,
      userId: `user-${userData.role}-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    setAuditLogs((prev) => [
      {
        auditId: `audit-${Date.now()}`,
        actorId: currentUser.userId,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'ENROLL_STUDENT',
        entityType: 'USER',
        entityId: newUser.userId,
        timestamp: new Date().toISOString(),
        reason: `New ${userData.role} account created for ${userData.name}`,
      },
      ...prev,
    ]);
    return newUser;
  };

  // Update User Status
  const updateUserStatus = (userId: string, status: 'active' | 'inactive') => {
    setUsers((prev) => prev.map((u) => (u.userId === userId ? { ...u, accountStatus: status } : u)));
  };

  // Add Subject
  const addSubject = (subjectData: Omit<Subject, 'subjectId'>) => {
    const newSubject: Subject = {
      ...subjectData,
      subjectId: `sub-${subjectData.subjectCode.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, newSubject]);
    return newSubject;
  };

  // Enroll Student
  const enrollStudentInSubject = (studentId: string, subjectId: string) => {
    const student = users.find((u) => u.userId === studentId);
    const newEnrollment: Enrollment = {
      enrollmentId: `enr-${Date.now()}`,
      studentId,
      studentName: student?.name,
      rollNumber: student?.rollNumber,
      subjectId,
      academicYear: config.academicYear,
      enrollmentStatus: 'enrolled',
    };
    setEnrollments((prev) => [...prev, newEnrollment]);
  };

  // Dismiss Notification
  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
  };

  // Export Attendance CSV
  const exportAttendanceCsv = (subjectId?: string) => {
    const recordsToExport = subjectId
      ? attendanceRecords.filter((r) => r.subjectId === subjectId)
      : attendanceRecords;

    const headers = ['Record ID', 'Session Date', 'Subject Code', 'Subject Name', 'Student Roll', 'Student Name', 'Status', 'Marked By', 'Marked At', 'Notes'];
    const rows = recordsToExport.map((r) => [
      r.recordId,
      r.sessionDate,
      `"${r.subjectCode || ''}"`,
      `"${r.subjectName || ''}"`,
      `"${r.rollNumber || ''}"`,
      `"${r.studentName || ''}"`,
      r.attendanceStatus.toUpperCase(),
      r.markedBy,
      r.markedAt,
      `"${r.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartattend-report-${subjectId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset demo
  const resetDemoData = () => {
    setUsers(initialUsers);
    setSubjects(initialSubjects);
    setAttendanceRecords(initialAttendanceRecords);
    setSessions(initialSessions);
    setAuditLogs(initialAuditLogs);
    setNotifications(initialNotifications);
    setCurrentUser(initialUsers[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        activeView,
        setActiveView,
        config,
        updateConfig,
        departments,
        users,
        subjects,
        enrollments,
        sessions,
        attendanceRecords,
        auditLogs,
        timetable,
        notifications,
        studentSummaries,
        overallAttendancePercentage,
        totalClassesHeld,
        totalClassesAttended,
        lowAttendanceCount,
        markAttendance,
        createSession,
        completeSession,
        verifyQrAttendance,
        addUser,
        updateUserStatus,
        addSubject,
        enrollStudentInSubject,
        dismissNotification,
        exportAttendanceCsv,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
