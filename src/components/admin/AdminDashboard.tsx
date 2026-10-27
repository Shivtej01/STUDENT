import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  GraduationCap,
  Building2,
  TrendingUp,
  ShieldCheck,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  Server,
  CloudCog,
  BookOpen,
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

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    departments,
    users,
    subjects,
    sessions,
    auditLogs,
    config,
    setActiveView,
  } = useApp();

  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalTeachers = users.filter((u) => u.role === 'teacher').length;

  // Department attendance benchmark data
  const departmentData = [
    { name: 'Computer Sci', attendanceRate: 82.4, students: 320 },
    { name: 'Electronics', attendanceRate: 74.8, students: 280 }, // Below 75%
    { name: 'Mechanical', attendanceRate: 85.1, students: 210 },
    { name: 'Info Tech', attendanceRate: 88.0, students: 190 },
  ];

  const recentAudits = auditLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Academic Administration Executive Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {currentUser.employeeId || 'DEAN-01'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {config.institutionName} • Senate Governance & Regulatory Oversight
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveView('system-settings')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <CloudCog className="w-4 h-4" />
            <span>AWS Infrastructure & Settings</span>
          </button>
        </div>
      </div>

      {/* 4 Institution KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </p>
            <div className="mt-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalStudents}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Active across 4 departments</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Total Faculty */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Teaching Faculty
            </p>
            <div className="mt-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalTeachers}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Professors & Instructors</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Subjects */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Courses
            </p>
            <div className="mt-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {subjects.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Semester 5 Curriculum</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Mandatory Threshold */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Senate Threshold
            </p>
            <div className="mt-1.5">
              <span className="text-3xl font-extrabold text-indigo-600 tracking-tight">
                {config.defaultThresholdPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-2">Statutory Minimum</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Department Attendance Benchmark & Recent Senate Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Benchmark Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Department-Wise Attendance Benchmark
              </h3>
              <p className="text-xs text-slate-500">Compliance vs. 75% Senate Cutoff</p>
            </div>
            <button
              onClick={() => setActiveView('monitoring')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>Detailed Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${val}%`, 'Avg Attendance']}
                />
                <Bar dataKey="attendanceRate" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Electronics &amp; Communication (74.8%)</strong> is currently below the 75% threshold.
              </span>
            </div>
            <button
              onClick={() => setActiveView('monitoring')}
              className="font-bold underline text-[11px]"
            >
              Inspect
            </button>
          </div>
        </div>

        {/* Recent Audit Trail (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Recent Audit Logs</h3>
              </div>
              <button
                onClick={() => setActiveView('audit-logs')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                All Logs ({auditLogs.length})
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentAudits.map((log) => (
                <div key={log.auditId} className="py-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 text-[11px] line-clamp-1">{log.reason}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Actor: {log.actorName} ({log.actorRole.toUpperCase()})
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>DynamoDB Table: sjte_attendance_audit_logs</span>
            <span className="text-emerald-600 font-bold">100% Immutable</span>
          </div>
        </div>
      </div>
    </div>
  );
};
