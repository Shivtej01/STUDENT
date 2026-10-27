import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Calculator,
  QrCode,
  Calendar,
  Sparkles,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    studentSummaries,
    overallAttendancePercentage,
    totalClassesHeld,
    totalClassesAttended,
    lowAttendanceCount,
    attendanceRecords,
    timetable,
    setActiveView,
  } = useApp();

  const totalMissed = totalClassesHeld - totalClassesAttended;
  const isOverallLow = overallAttendancePercentage < 75;

  // Chart data: Weekly attendance trends
  const trendData = [
    { week: 'W1 (Sep)', percentage: 88, target: 75 },
    { week: 'W2 (Sep)', percentage: 85, target: 75 },
    { week: 'W3 (Sep)', percentage: 82, target: 75 },
    { week: 'W4 (Sep)', percentage: 79, target: 75 },
    { week: 'W5 (Oct)', percentage: 76, target: 75 },
    { week: 'W6 (Oct)', percentage: 78.5, target: 75 },
  ];

  // Recent 6 records
  const recentRecords = attendanceRecords
    .filter((r) => r.studentId === currentUser.userId)
    .slice(0, 6);

  // Today's classes (e.g. Monday schedule)
  const todaysClasses = timetable.filter((t) => t.dayOfWeek === 'Monday');

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {currentUser.rollNumber}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Department of {currentUser.departmentName || 'Computer Science & Engineering'} • Semester 5
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveView('qr-scanner')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Classroom QR</span>
          </button>
          <button
            onClick={() => setActiveView('subject-wise')}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors border border-slate-200"
          >
            <Calculator className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Target Calculator</span>
          </button>
        </div>
      </div>

      {/* Low Attendance Emergency Banner (if applicable) */}
      {lowAttendanceCount > 0 && (
        <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 sm:p-5 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Attendance Shortage Detected in {lowAttendanceCount} Subject{lowAttendanceCount > 1 ? 's' : ''}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Institutional Senate policy mandates at least 75.0% attendance for exam hall ticket eligibility.
                You have critical shortages in subjects like{' '}
                {studentSummaries
                  .filter((s) => s.isLow)
                  .map((s) => `${s.subject.subjectCode} (${s.percentage}%)`)
                  .join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('subject-wise')}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-xs"
          >
            <span>Resolve Shortage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Percentage */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Attendance
            </p>
            <div className="flex items-baseline space-x-2 mt-1.5">
              <span
                className={`text-3xl font-extrabold tracking-tight ${
                  isOverallLow ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {overallAttendancePercentage}%
              </span>
              <span className="text-xs font-medium text-slate-400">/ 75% Min</span>
            </div>
            <div className="mt-2 flex items-center space-x-1.5">
              <span
                className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  isOverallLow
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isOverallLow ? 'Below Requirement' : 'Eligible for Exams'}
              </span>
            </div>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm ${
              isOverallLow
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}
          >
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Classes Held */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Classes Held
            </p>
            <div className="mt-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalClassesHeld}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Across 5 enrolled courses</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Classes Attended */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Classes Attended
            </p>
            <div className="mt-1.5">
              <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                {totalClassesAttended}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Present + Late</span>
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Classes Missed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Classes Missed
            </p>
            <div className="mt-1.5">
              <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
                {totalMissed}
              </span>
            </div>
            <p className="text-[11px] text-rose-500 font-medium mt-2 flex items-center space-x-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Recorded Absences</span>
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Subject Table & Attendance Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Breakdown Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Enrolled Subjects Attendance</h2>
              <p className="text-xs text-slate-500">Live deterministic metrics calculated by backend</p>
            </div>
            <button
              onClick={() => setActiveView('subject-wise')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-3 text-center">Held</th>
                  <th className="py-3 px-3 text-center">Attended</th>
                  <th className="py-3 px-3 text-center">Missed</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentSummaries.map((item) => (
                  <tr key={item.subject.subjectId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.subject.subjectCode}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {item.subject.subjectName}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium text-slate-700">{item.totalHeld}</td>
                    <td className="py-3.5 px-3 text-center font-semibold text-emerald-600">{item.attended}</td>
                    <td className="py-3.5 px-3 text-center font-semibold text-rose-500">{item.absent}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.isLow ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold text-xs ${
                            item.isLow ? 'text-amber-600' : 'text-slate-900'
                          }`}
                        >
                          {item.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.isLow
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.isLow ? 'Shortage' : 'Safe'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveView('subject-wise')}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>Calc</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Trend Chart (1 Column) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Attendance Trend</h3>
                <p className="text-xs text-slate-500">Semester 5 progression</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                Weekly
              </span>
            </div>

            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${val}%`, 'Attendance']}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#attendanceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
              <span>Current: {overallAttendancePercentage}%</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>Threshold: 75%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Today's Timetable & Recent Attendance Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Today's Class Schedule</h3>
            </div>
            <button
              onClick={() => setActiveView('timetable')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Full Timetable
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {todaysClasses.map((item, idx) => (
              <div key={item.slotId} className="py-3.5 flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-12 text-center py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                    {item.startTime}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.subjectName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.subjectCode} • {item.teacherName} • Room: {item.room}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      idx === 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx === 0 ? 'Upcoming Next' : 'Scheduled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attendance Records Log */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Recent Attendance Records</h3>
            </div>
            <button
              onClick={() => setActiveView('history')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              All Records
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentRecords.map((rec) => (
              <div key={rec.recordId} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="shrink-0">
                    {rec.attendanceStatus === 'present' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    {rec.attendanceStatus === 'absent' && (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    {rec.attendanceStatus === 'late' && (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{rec.subjectCode} - {rec.subjectName}</p>
                    <p className="text-[11px] text-slate-400">
                      {rec.sessionDate} • Via {rec.markedBy === 'student_qr' ? 'QR Code' : 'Instructor'}
                      {rec.notes ? ` • ${rec.notes}` : ''}
                    </p>
                  </div>
                </div>
                <span
                  className={`capitalize text-xs font-semibold px-2 py-0.5 rounded ${
                    rec.attendanceStatus === 'present'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : rec.attendanceStatus === 'absent'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {rec.attendanceStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
