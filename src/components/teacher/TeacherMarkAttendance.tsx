import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Search,
  AlertCircle,
  ShieldCheck,
  Check,
  User,
} from 'lucide-react';
import { AttendanceStatus } from '../../types/attendance';

export const TeacherMarkAttendance: React.FC = () => {
  const {
    currentUser,
    subjects,
    enrollments,
    users,
    markAttendance,
    createSession,
    setActiveView,
  } = useApp();

  const mySubjects = subjects.filter((s) => s.teacherId === currentUser.userId);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    mySubjects[0]?.subjectId || ''
  );
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [sessionTime, setSessionTime] = useState<string>('09:00 - 10:00');
  const [room, setRoom] = useState<string>('Lab-302');
  const [searchFilter, setSearchFilter] = useState('');

  // Selected subject
  const currentSubject = subjects.find((s) => s.subjectId === selectedSubjectId);

  // Enrolled students for selected subject
  const enrolledStudentIds = enrollments
    .filter((e) => e.subjectId === selectedSubjectId && e.enrollmentStatus === 'enrolled')
    .map((e) => e.studentId);

  const enrolledStudents = users.filter((u) => enrolledStudentIds.includes(u.userId));

  // Current attendance form state
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach((s) => {
      initial[s.userId] = 'present';
    });
    return initial;
  });

  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Quick actions
  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach((s) => {
      updated[s.userId] = status;
    });
    setAttendanceMap(updated);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleNotesChange = (studentId: string, text: string) => {
    setNotesMap((prev) => ({ ...prev, [studentId]: text }));
  };

  // Counts
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'present').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'late').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'absent').length;

  const handleSaveAttendance = () => {
    // 1. Create session record
    const [startTime, endTime] = sessionTime.split(' - ');
    const newSession = createSession({
      subjectId: selectedSubjectId,
      subjectCode: currentSubject?.subjectCode,
      subjectName: currentSubject?.subjectName,
      teacherId: currentUser.userId,
      teacherName: currentUser.name,
      sessionDate,
      startTime: startTime || '09:00',
      endTime: endTime || '10:00',
      sessionStatus: 'completed',
      sessionType: 'manual',
      room,
      totalStudentsEnrolled: enrolledStudents.length,
      presentCount,
      lateCount,
      absentCount,
    });

    // 2. Mark individual attendance records
    enrolledStudents.forEach((st) => {
      const status = attendanceMap[st.userId] || 'present';
      const notes = notesMap[st.userId];
      markAttendance(newSession.sessionId, st.userId, status, notes, currentUser.userId);
    });

    setShowConfirmModal(false);
    setSaveSuccessMessage(
      `Attendance for ${currentSubject?.subjectCode} successfully committed to Amazon DynamoDB (Session ID: ${newSession.sessionId}).`
    );
  };

  const filteredStudents = enrolledStudents.filter((s) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.rollNumber || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Manual Roll Call & Attendance Sheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conduct in-class roll call with audit trail and instant DynamoDB sync
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveView('qr-session')}
            className="text-xs font-semibold px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors"
          >
            Switch to Dynamic QR Session
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Session Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Lecture Session Configuration
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-indigo-500 font-medium"
            >
              {mySubjects.map((s) => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.subjectCode} - {s.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Session Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lecture Time Slot</label>
            <input
              type="text"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              placeholder="09:00 - 10:00"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Classroom / Lab</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Lab-302"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-indigo-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Attendance Sheet Table & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700">Quick Mark:</span>
            <button
              onClick={() => handleMarkAll('present')}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-2.5 py-1 text-xs font-semibold bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg transition-colors"
            >
              All Absent
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter student..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div className="text-xs text-slate-500 flex items-center space-x-2">
              <span className="font-semibold text-emerald-700">{presentCount} P</span>
              <span>•</span>
              <span className="font-semibold text-amber-600">{lateCount} L</span>
              <span>•</span>
              <span className="font-semibold text-rose-600">{absentCount} A</span>
            </div>
          </div>
        </div>

        {/* Student Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4 text-center">Attendance Status</th>
                <th className="py-3 px-4">Audit Note / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No students found matching this criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const currentStatus = attendanceMap[st.userId] || 'present';

                  return (
                    <tr key={st.userId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          {st.avatar ? (
                            <img
                              src={st.avatar}
                              alt={st.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                              {st.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{st.name}</p>
                            <p className="text-[11px] text-slate-400">{st.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {st.rollNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Present Button */}
                          <button
                            onClick={() => handleStatusChange(st.userId, 'present')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 transition-all ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          {/* Late Button */}
                          <button
                            onClick={() => handleStatusChange(st.userId, 'late')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 transition-all ${
                              currentStatus === 'late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Late</span>
                          </button>

                          {/* Absent Button */}
                          <button
                            onClick={() => handleStatusChange(st.userId, 'absent')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Optional audit reason (e.g. sick note)..."
                          value={notesMap[st.userId] || ''}
                          onChange={(e) => handleNotesChange(st.userId, e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Save Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs text-slate-500">
            Total Enrolled: <strong className="text-slate-900">{enrolledStudents.length}</strong> •{' '}
            Review attendance before committing to DynamoDB.
          </div>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={enrolledStudents.length === 0}
            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Commit Attendance Records</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-indigo-600">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Confirm Attendance Submission</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to submit the official attendance roll for{' '}
              <strong>{currentSubject?.subjectCode} ({currentSubject?.subjectName})</strong> on{' '}
              <strong>{sessionDate}</strong>.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Students:</span>
                <span className="font-bold text-slate-900">{enrolledStudents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 font-semibold">Marked Present:</span>
                <span className="font-bold text-emerald-700">{presentCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-600 font-semibold">Marked Late:</span>
                <span className="font-bold text-amber-600">{lateCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-600 font-semibold">Marked Absent:</span>
                <span className="font-bold text-rose-600">{absentCount}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              An immutable audit log will be generated recording your instructor ID ({currentUser.employeeId}) and server timestamp.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Go Back & Review
              </button>
              <button
                onClick={handleSaveAttendance}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
              >
                Confirm & Write to DynamoDB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
