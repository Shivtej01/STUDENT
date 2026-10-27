import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateFutureClassesNeeded,
  calculateBunkAllowance,
} from '../../utils/attendanceCalculator';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Info,
  Calendar,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const SubjectAttendanceView: React.FC = () => {
  const { studentSummaries, config, setActiveView } = useApp();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    studentSummaries.find((s) => s.isLow)?.subject.subjectId || studentSummaries[0]?.subject.subjectId || ''
  );
  const [targetPercentage, setTargetPercentage] = useState<number>(75);

  const selectedSummary = studentSummaries.find((s) => s.subject.subjectId === selectedSubjectId);

  // Target calculation results
  const targetResult = selectedSummary
    ? calculateFutureClassesNeeded(
        selectedSummary.attended,
        selectedSummary.totalHeld,
        targetPercentage
      )
    : null;

  const bunkResult = selectedSummary
    ? calculateBunkAllowance(
        selectedSummary.attended,
        selectedSummary.totalHeld,
        config.defaultThresholdPercentage
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Subject Attendance & Target Planner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Deterministic mathematical projection engine for Semester 5 course requirements
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
              Institutional Cutoff: {config.defaultThresholdPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Calculator + Subject Deep-Dive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Interactive Target Calculator */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Attendance Target Simulator</h2>
              <p className="text-[11px] text-slate-500">Calculate future classes needed using Senate formula</p>
            </div>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-indigo-500"
            >
              {studentSummaries.map((s) => (
                <option key={s.subject.subjectId} value={s.subject.subjectId}>
                  {s.subject.subjectCode} - {s.subject.subjectName} ({s.percentage}%)
                </option>
              ))}
            </select>
          </div>

          {/* Target Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Desired Target Percentage
              </label>
              <span className="text-sm font-extrabold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md">
                {targetPercentage}%
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={95}
              step={1}
              value={targetPercentage}
              onChange={(e) => setTargetPercentage(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>60% (Warning)</span>
              <span className="font-bold text-indigo-600">75% (Mandatory)</span>
              <span>85%</span>
              <span>95%</span>
            </div>
          </div>

          {/* Authoritative Projection Box */}
          {selectedSummary && targetResult && (
            <div className="space-y-4 pt-2">
              <div
                className={`p-4 rounded-xl border ${
                  targetResult.classesNeeded > 0
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  {targetResult.classesNeeded > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold">
                      {targetResult.classesNeeded > 0
                        ? `Required: Attend Next ${targetResult.classesNeeded} Consecutive Classes`
                        : `Target Met: Already at or above ${targetPercentage}%`}
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">
                      {targetResult.message}
                    </p>
                  </div>
                </div>

                {targetResult.achievable && targetResult.classesNeeded > 0 && (
                  <div className="mt-3 pt-3 border-t border-amber-200/70 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-white/80 p-2 rounded-lg">
                      <span className="block text-[10px] text-slate-500 uppercase">After {targetResult.classesNeeded} Classes</span>
                      <span className="font-extrabold text-slate-900">
                        {targetResult.classesAttended + targetResult.classesNeeded} / {targetResult.classesHeld + targetResult.classesNeeded}
                      </span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg">
                      <span className="block text-[10px] text-slate-500 uppercase">Projected %</span>
                      <span className="font-extrabold text-emerald-600">
                        {Math.round(((targetResult.classesAttended + targetResult.classesNeeded) / (targetResult.classesHeld + targetResult.classesNeeded)) * 1000) / 10}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bunk Allowance Tooltip / Card */}
              {bunkResult && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs">
                  <div className="flex items-center space-x-2 font-semibold text-slate-900 mb-1">
                    <Info className="w-4 h-4 text-indigo-600" />
                    <span>Safe Leave / Bunk Allowance</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    {bunkResult.message}
                  </p>
                </div>
              )}

              {/* Mathematical Formula Reference */}
              <div className="p-3 bg-slate-100/70 rounded-xl text-[10px] text-slate-500 font-mono space-y-1">
                <p className="font-bold uppercase text-slate-600">Deterministic Senate Formula:</p>
                <p>n = max(0, ⌈(T × H - A) / (1 - T)⌉)</p>
                <p>T = {targetPercentage / 100} | H = {selectedSummary.totalHeld} held | A = {selectedSummary.attended} attended</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Subject Cards Detailed List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-base font-bold text-slate-900 px-1">
            Course Attendance Cards
          </h2>

          <div className="space-y-4">
            {studentSummaries.map((item) => {
              const isSelected = item.subject.subjectId === selectedSubjectId;

              return (
                <div
                  key={item.subject.subjectId}
                  onClick={() => setSelectedSubjectId(item.subject.subjectId)}
                  className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-50 shadow-md'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {item.subject.subjectCode}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {item.subject.subjectName}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Instructor: {item.subject.teacherName} • Room: {item.subject.room || 'TBA'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                          item.isLow
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-500">
                        {item.attended} of {item.totalHeld} classes attended
                      </span>
                      <span className="font-semibold text-slate-700">
                        {item.percentage}% (Min: {item.threshold}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.isLow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick stats row */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="block text-[10px] text-slate-400 font-medium">Attended</span>
                      <span className="font-bold text-emerald-600">{item.attended}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="block text-[10px] text-slate-400 font-medium">Missed</span>
                      <span className="font-bold text-rose-600">{item.absent}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="block text-[10px] text-slate-400 font-medium">Late</span>
                      <span className="font-bold text-amber-600">{item.late}</span>
                    </div>
                  </div>

                  {/* Status alert if low */}
                  {item.isLow && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                      <div className="flex items-center space-x-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Shortage: Attend next {item.classesNeededForTarget} classes to reach 75%</span>
                      </div>
                      <span className="font-bold text-[11px] underline">Select to Simulate</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
