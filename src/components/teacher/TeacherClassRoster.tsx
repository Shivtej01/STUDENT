import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const TeacherClassRoster: React.FC = () => {
  const { currentUser, subjects, enrollments, users, attendanceRecords } = useApp();

  const mySubjects = subjects.filter((s) => s.teacherId === currentUser.userId);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(mySubjects[0]?.subjectId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShortageOnly, setFilterShortageOnly] = useState(false);

  // Compute roster items
  const roster = mySubjects.flatMap((sub) => {
    const enrolledIds = enrollments
      .filter((e) => e.subjectId === sub.subjectId && e.enrollmentStatus === 'enrolled')
      .map((e) => e.studentId);

    return enrolledIds.map((sId) => {
      const student = users.find((u) => u.userId === sId);
      const records = attendanceRecords.filter(
        (r) => r.studentId === sId && r.subjectId === sub.subjectId
      );
      const totalHeld = records.length;
      const attended = records.filter(
        (r) => r.attendanceStatus === 'present' || r.attendanceStatus === 'late'
      ).length;
      const pct = totalHeld > 0 ? Math.round((attended / totalHeld) * 1000) / 10 : 100;
      const isLow = pct < (sub.threshold || 75);

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
        isLow,
      };
    });
  });

  const filteredRoster = roster.filter((item) => {
    if (selectedSubjectId !== 'all' && item.subjectId !== selectedSubjectId) return false;
    if (filterShortageOnly && !item.isLow) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.studentName.toLowerCase().includes(q);
      const matchRoll = item.rollNumber.toLowerCase().includes(q);
      if (!matchName && !matchRoll) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Student Class Roster & Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enrolled students across your assigned course sections
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
            Total Enrolled: {roster.length} Records
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or roll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-indigo-500"
          />
        </div>

        {/* Subject Select */}
        <div>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-indigo-500"
          >
            <option value="all">All Assigned Courses</option>
            {mySubjects.map((s) => (
              <option key={s.subjectId} value={s.subjectId}>
                {s.subjectCode} - {s.subjectName}
              </option>
            ))}
          </select>
        </div>

        {/* Shortage Toggle */}
        <div className="flex items-center space-x-2 px-1">
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterShortageOnly}
              onChange={(e) => setFilterShortageOnly(e.target.checked)}
              className="rounded accent-rose-600 w-4 h-4"
            />
            <span>Show Only Attendance Shortages (&lt; 75%)</span>
          </label>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4 text-center">Attended / Held</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRoster.map((item, idx) => (
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
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
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
                      <span
                        className={`font-extrabold text-xs px-2 py-0.5 rounded ${
                          item.isLow
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[11px] font-semibold ${
                          item.isLow ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {item.isLow ? 'Shortage Alert' : 'Eligible'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`mailto:${item.email}`}
                        className="inline-flex items-center space-x-1 p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
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
