import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { AttendanceStatus } from '../../types/attendance';

export const AttendanceHistoryView: React.FC = () => {
  const { currentUser, attendanceRecords, subjects, exportAttendanceCsv } = useApp();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter student's own records
  const myRecords = attendanceRecords.filter((r) => r.studentId === currentUser.userId);

  const filteredRecords = myRecords.filter((r) => {
    if (selectedSubject !== 'all' && r.subjectId !== selectedSubject) return false;
    if (statusFilter !== 'all' && r.attendanceStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = (r.subjectName || '').toLowerCase().includes(q) || (r.subjectCode || '').toLowerCase().includes(q);
      const matchDate = r.sessionDate.includes(q);
      if (!matchSubject && !matchDate) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Attendance Log & Audit History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete chronological record of verified lectures, labs, and attendance statuses
          </p>
        </div>

        <button
          onClick={() => exportAttendanceCsv()}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Official Report (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subject or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-indigo-500"
          />
        </div>

        {/* Subject Filter */}
        <div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-indigo-500"
          >
            <option value="all">All Registered Subjects</option>
            {subjects.map((s) => (
              <option key={s.subjectId} value={s.subjectId}>
                {s.subjectCode} - {s.subjectName}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-indigo-500"
          >
            <option value="all">All Statuses (Present, Absent, Late)</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
            <option value="late">Late Only</option>
          </select>
        </div>
      </div>

      {/* History Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredRecords.length}</strong> of{' '}
            {myRecords.length} total attendance records
          </span>
          <span className="text-[11px] font-mono">DynamoDB: sjte_attendance_records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Marked Via</th>
                <th className="py-3 px-4">Notes / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.recordId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{r.sessionDate}</div>
                      <div className="text-[11px] text-slate-400">{r.sessionTime || '09:00 - 10:00'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.subjectCode}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{r.subjectName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          r.attendanceStatus === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.attendanceStatus === 'absent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {r.attendanceStatus === 'present' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {r.attendanceStatus === 'absent' && <XCircle className="w-3.5 h-3.5" />}
                        {r.attendanceStatus === 'late' && <Clock className="w-3.5 h-3.5" />}
                        <span className="capitalize">{r.attendanceStatus}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="capitalize font-medium">
                        {r.markedBy === 'student_qr' ? 'Dynamic QR Code' : 'Faculty Member'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {r.notes || '—'}
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
