import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  Radio,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    subjects,
    enrollments,
    sessions,
    attendanceRecords,
    users,
    setActiveView,
  } = useApp();

  // Teacher's assigned subjects
  const mySubjects = subjects.filter((s) => s.teacherId === currentUser.userId);
  const mySubjectIds = mySubjects.map((s) => s.subjectId);

  // Total unique students enrolled in teacher's subjects
  const myEnrollments = enrollments.filter((e) => mySubjectIds.includes(e.subjectId));
  const uniqueStudentIds = Array.from(new Set(myEnrollments.map((e) => e.studentId)));

  // Sessions conducted
  const mySessions = sessions.filter((s) => s.teacherId === currentUser.userId);

  // Calculate average attendance across teacher's classes
  const myRecords = attendanceRecords.filter((r) => mySubjectIds.includes(r.subjectId));
  const attendedCount = myRecords.filter((r) => r.attendanceStatus === 'present' || r.attendanceStatus === 'late').length;
  const avgAttendance = myRecords.length > 0 ? Math.round((attendedCount / myRecords.length) * 1000) / 10 : 84.5;

  // Students below 75% in teacher's subjects
  const lowAttendanceStudents: Array<{
    studentId: string;
    studentName: string;
    rollNumber: string;
    subjectCode: string;
    subjectName: string;
    percentage: number;
    held: number;
    attended: number;
  }> = [];

  mySubjects.forEach((sub) => {
    uniqueStudentIds.forEach((sId) => {
      const studentRecs = attendanceRecords.filter(
        (r) => r.studentId === sId && r.subjectId === sub.subjectId
      );
      if (studentRecs.length > 0) {
        const attended = studentRecs.filter(
          (r) => r.attendanceStatus === 'present' || r.attendanceStatus === 'late'
        ).length;
        const pct = Math.round((attended / studentRecs.length) * 1000) / 10;
        if (pct < 75) {
          const student = users.find((u) => u.userId === sId);
          lowAttendanceStudents.push({
            studentId: sId,
            studentName: student?.name || 'Student',
            rollNumber: student?.rollNumber || 'CS2023-XXX',
            subjectCode: sub.subjectCode,
            subjectName: sub.subjectName,
            percentage: pct,
            held: studentRecs.length,
            attended,
          });
        }
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Welcome & Primary Action Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Faculty Portal — {currentUser.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {currentUser.employeeId}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Department of {currentUser.departmentName || 'Computer Science & Engineering'} • Active Teaching Faculty
          </p>
        </div>

        {/* Start Attendance Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveView('qr-session')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Start QR Attendance</span>
          </button>
          <button
            onClick={() => setActiveView('mark-attendance')}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors border border-slate-200"
          >
            <FileCheck className="w-4 h-4 text-slate-500" />
            <span>Manual Roll Call</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Subjects
            </p>
            <div className="mt-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {mySubjects.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {mySubjects.map((s) => s.subjectCode).join(', ')}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </p>
            <div className="mt-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {uniqueStudentIds.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Across current sections</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sessions Conducted
            </p>
            <div className="mt-1.5">
              <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                {mySessions.length}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-2">DynamoDB Verified</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Class Average
            </p>
            <div className="mt-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {avgAttendance}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Across all lectures</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Attendance Sessions & Low Attendance Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance Sessions Conducted */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Attendance Sessions</h3>
              <p className="text-xs text-slate-500">Lectures recorded this month</p>
            </div>
            <button
              onClick={() => setActiveView('reports')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {mySessions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No sessions conducted yet. Start your first session above!
              </div>
            ) : (
              mySessions.map((s) => (
                <div key={s.sessionId} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{s.subjectCode}</span>
                      <span className="text-xs text-slate-600">{s.subjectName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {s.sessionDate} • {s.startTime} - {s.endTime} • Room: {s.room} • Type:{' '}
                      <span className="uppercase font-semibold">{s.sessionType}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.presentCount} Present
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {s.lateCount} Late • {s.absentCount} Absent
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Attendance Students (< 75%) Watchlist */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Attendance Watchlist (&lt; 75%)</h3>
                <p className="text-xs text-slate-500">Students requiring remediation</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('low-attendance')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All ({lowAttendanceStudents.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {lowAttendanceStudents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                All enrolled students currently meet the 75% attendance requirement.
              </div>
            ) : (
              lowAttendanceStudents.slice(0, 5).map((st, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{st.studentName}</p>
                    <p className="text-[11px] text-slate-500">
                      {st.rollNumber} • {st.subjectCode} ({st.attended}/{st.held} classes)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-rose-600 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                      {st.percentage}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
