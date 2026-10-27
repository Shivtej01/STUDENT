import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LineChart,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { calculateAttendancePercentage } from '../../utils/attendanceCalculator';

export const AdminMonitoring: React.FC = () => {
  const { departments, subjects, users, attendanceRecords, exportAttendanceCsv, config } = useApp();
  const [selectedDept, setSelectedDept] = useState('all');

  const students = users.filter((u) => u.role === 'student');

  // Compute metrics across departments
  const departmentStats = departments.map((dept) => {
    const deptStudents = students.filter((s) => s.departmentId === dept.departmentId);
    const deptStudentIds = deptStudents.map((s) => s.userId);

    const deptRecords = attendanceRecords.filter((r) => deptStudentIds.includes(r.studentId));
    const attended = deptRecords.filter((r) => r.attendanceStatus === 'present' || r.attendanceStatus === 'late').length;
    const avgPct = deptRecords.length > 0 ? calculateAttendancePercentage(attended, deptRecords.length) : 80;

    return {
      department: dept,
      studentCount: deptStudents.length,
      recordsCount: deptRecords.length,
      averagePercentage: avgPct,
      isCompliant: avgPct >= config.defaultThresholdPercentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Attendance Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Senate compliance review, department benchmarks, and consolidated accreditation exports
          </p>
        </div>

        <button
          onClick={() => exportAttendanceCsv()}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export All Campus Data (CSV)</span>
        </button>
      </div>

      {/* Department Compliance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departmentStats.map((stat) => (
          <div
            key={stat.department.departmentId}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                {stat.department.departmentCode}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  stat.isCompliant
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {stat.isCompliant ? 'Compliant' : 'Warning'}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{stat.department.departmentName}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">HOD: {stat.department.hodName}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900">
                {stat.averagePercentage}%
              </span>
              <span className="text-xs text-slate-400">Target: {config.defaultThresholdPercentage}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Course Compliance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Course-Level Attendance Statistics</h2>
          <span className="text-xs text-slate-400">DynamoDB Aggregated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4 text-center">Threshold</th>
                <th className="py-3 px-4 text-center">Classes Conducted</th>
                <th className="py-3 px-4 text-center">Avg Attendance</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((sub) => {
                const subRecs = attendanceRecords.filter((r) => r.subjectId === sub.subjectId);
                const attended = subRecs.filter((r) => r.attendanceStatus === 'present' || r.attendanceStatus === 'late').length;
                const pct = subRecs.length > 0 ? calculateAttendancePercentage(attended, subRecs.length) : 85;
                const isSafe = pct >= (sub.threshold || 75);

                return (
                  <tr key={sub.subjectId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{sub.subjectCode}</span>
                      <span className="text-slate-500 ml-1.5">{sub.subjectName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {sub.teacherName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {sub.threshold}%
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                      {subRecs.length}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-extrabold text-xs px-2 py-0.5 rounded ${
                          isSafe
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {pct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[11px] font-semibold ${isSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isSafe ? 'Senate Compliant' : 'Remediation Required'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
