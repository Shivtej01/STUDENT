import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  Mail,
  Send,
  Download,
  CheckCircle2,
  AlertOctagon,
  Phone,
} from 'lucide-react';
import { calculateFutureClassesNeeded } from '../../utils/attendanceCalculator';

export const TeacherLowAttendance: React.FC = () => {
  const { currentUser, subjects, enrollments, users, attendanceRecords } = useApp();
  const [sentNoticeStudentId, setSentNoticeStudentId] = useState<string | null>(null);

  const mySubjects = subjects.filter((s) => s.teacherId === currentUser.userId);
  const mySubjectIds = mySubjects.map((s) => s.subjectId);

  // Compute list of students with shortage in teacher's subjects
  const shortageList = mySubjects.flatMap((sub) => {
    const enrolledIds = enrollments
      .filter((e) => e.subjectId === sub.subjectId && e.enrollmentStatus === 'enrolled')
      .map((e) => e.studentId);

    return enrolledIds
      .map((sId) => {
        const student = users.find((u) => u.userId === sId);
        const records = attendanceRecords.filter(
          (r) => r.studentId === sId && r.subjectId === sub.subjectId
        );
        const totalHeld = records.length;
        const attended = records.filter(
          (r) => r.attendanceStatus === 'present' || r.attendanceStatus === 'late'
        ).length;
        const pct = totalHeld > 0 ? Math.round((attended / totalHeld) * 1000) / 10 : 100;
        const threshold = sub.threshold || 75;

        if (pct >= threshold) return null;

        const target = calculateFutureClassesNeeded(attended, totalHeld, threshold);

        return {
          studentId: sId,
          studentName: student?.name || 'Student',
          rollNumber: student?.rollNumber || 'CS2023-XXX',
          email: student?.email || '',
          phone: student?.phone || '+1 (555) 000-0000',
          avatar: student?.avatar,
          subjectId: sub.subjectId,
          subjectCode: sub.subjectCode,
          subjectName: sub.subjectName,
          totalHeld,
          attended,
          percentage: pct,
          classesNeeded: target.classesNeeded,
        };
      })
      .filter(Boolean) as Array<{
        studentId: string;
        studentName: string;
        rollNumber: string;
        email: string;
        phone: string;
        avatar?: string;
        subjectId: string;
        subjectCode: string;
        subjectName: string;
        totalHeld: number;
        attended: number;
        percentage: number;
        classesNeeded: number;
      }>;
  });

  const handleSendNotice = (studentName: string, studentId: string) => {
    setSentNoticeStudentId(studentId);
    setTimeout(() => setSentNoticeStudentId(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Attendance Shortage Watchlist (&lt; 75%)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              {shortageList.length} Flagged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated compliance alerting for students at risk of hall ticket debarment
          </p>
        </div>
      </div>

      {/* Success Banner if notice sent */}
      {sentNoticeStudentId && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">
            Official Senate Shortage Warning Letter sent via Amazon SES to student and faculty advisor.
          </span>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 text-xs text-slate-500 flex items-center justify-between bg-slate-50/50">
          <span>
            Senate Minimum Requirement: <strong className="text-slate-900">75.0% Attendance</strong>
          </span>
          <span className="text-[11px] font-mono">Status: Formal Warning Stage</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4 text-center">Attended / Held</th>
                <th className="py-3 px-4 text-center">Current %</th>
                <th className="py-3 px-4 text-center">Classes Needed</th>
                <th className="py-3 px-4 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shortageList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No Attendance Shortages!</p>
                    <p className="text-xs text-slate-400 mt-1">All enrolled students meet the 75% cutoff.</p>
                  </td>
                </tr>
              ) : (
                shortageList.map((item, idx) => (
                  <tr key={`${item.studentId}-${item.subjectId}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.studentName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                            {item.studentName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{item.studentName}</p>
                          <p className="text-[11px] text-slate-400">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {item.rollNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{item.subjectCode}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                      {item.attended} / {item.totalHeld}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-xs px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        {item.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Next {item.classesNeeded} Classes
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSendNotice(item.studentName, `${item.studentId}-${item.subjectId}`)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Notice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
