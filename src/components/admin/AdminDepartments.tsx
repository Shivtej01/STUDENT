import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Users, GraduationCap, BookOpen, CheckCircle2 } from 'lucide-react';

export const AdminDepartments: React.FC = () => {
  const { departments, subjects, users, config } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Departments &amp; Semesters
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Current Academic Session: {config.academicYear} • {config.currentSemester}
          </p>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((d) => {
          const deptSubjects = subjects.filter((s) => s.departmentId === d.departmentId);
          const deptTeachers = users.filter((u) => u.role === 'teacher' && u.departmentId === d.departmentId);

          return (
            <div
              key={d.departmentId}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {d.departmentCode}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{d.departmentName}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Head of Department: {d.hodName}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Students</span>
                  <span className="text-lg font-extrabold text-slate-900">{d.totalStudents}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Faculty</span>
                  <span className="text-lg font-extrabold text-indigo-600">{deptTeachers.length || d.totalTeachers}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Active Courses</span>
                  <span className="text-lg font-extrabold text-emerald-600">{deptSubjects.length}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned Semester Courses:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {deptSubjects.map((s) => (
                    <span
                      key={s.subjectId}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-semibold"
                    >
                      {s.subjectCode}: {s.subjectName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
