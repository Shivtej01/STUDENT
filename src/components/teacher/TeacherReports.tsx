import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Download,
  FileSpreadsheet,
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const TeacherReports: React.FC = () => {
  const { currentUser, subjects, attendanceRecords, exportAttendanceCsv } = useApp();
  const mySubjects = subjects.filter((s) => s.teacherId === currentUser.userId);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(mySubjects[0]?.subjectId || '');

  const selectedSubject = subjects.find((s) => s.subjectId === selectedSubjectId);

  // Day-of-week attendance trends data
  const dayDistributionData = [
    { day: 'Mon', attendanceRate: 88, sessions: 6 },
    { day: 'Tue', attendanceRate: 84, sessions: 5 },
    { day: 'Wed', attendanceRate: 91, sessions: 6 },
    { day: 'Thu', attendanceRate: 86, sessions: 5 },
    { day: 'Fri', attendanceRate: 72, sessions: 4 }, // Friday drop pattern
  ];

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Attendance Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official departmental compliance reports, daily trends, and automated CSV generation
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportAttendanceCsv(selectedSubjectId)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Subject CSV</span>
          </button>
        </div>
      </div>

      {/* Course Selection */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-700 uppercase">Select Course:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-indigo-500"
          >
            {mySubjects.map((s) => (
              <option key={s.subjectId} value={s.subjectId}>
                {s.subjectCode} - {s.subjectName}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Senate Compliance Threshold: <strong className="text-slate-900">{selectedSubject?.threshold || 75}%</strong>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day-of-Week Attendance Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Day-of-Week Attendance Pattern</h3>
              <p className="text-xs text-slate-500">Average % turnout across weekdays</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
              Current Semester
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${val}%`, 'Turnout']}
                />
                <Bar dataKey="attendanceRate" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-xs flex items-center justify-between">
            <span>Noticeable dip on Friday (72%) — Recommended: Schedule interactive problem sessions</span>
          </div>
        </div>

        {/* AWS Storage & S3 Archival Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600">
              <FileSpreadsheet className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Institutional S3 Archival</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Encrypted monthly snapshots stored automatically in Amazon S3 for accreditation audits
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/60">
                <div>
                  <p className="font-bold text-slate-800">September 2026 Monthly Consolidated</p>
                  <p className="text-[10px] text-slate-400">SHA256 Checksum: a89f...28b1 • S3 Glacier Instant</p>
                </div>
                <button
                  onClick={() => exportAttendanceCsv()}
                  className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg"
                >
                  Download
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/60">
                <div>
                  <p className="font-bold text-slate-800">October 2026 Mid-Semester Audit</p>
                  <p className="text-[10px] text-slate-400">SHA256 Checksum: f41e...90aa • S3 Standard</p>
                </div>
                <button
                  onClick={() => exportAttendanceCsv()}
                  className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg"
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            AWS S3 Bucket: arn:aws:s3:::sjte-attendance-reports-prod
          </div>
        </div>
      </div>
    </div>
  );
};
