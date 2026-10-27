import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';

export const StudentTimetable: React.FC = () => {
  const { timetable } = useApp();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const [activeDay, setActiveDay] = useState<typeof days[number]>('Monday');

  const slotsForDay = timetable.filter((t) => t.dayOfWeek === activeDay);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Semester 5 Weekly Timetable
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Academic Year 2026-2027 • Computer Science & Engineering Section A
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
              Fall 2026 Schedule
            </span>
          </div>
        </div>

        {/* Days selector tabs */}
        <div className="flex space-x-2 overflow-x-auto mt-6 pb-1">
          {days.map((day) => {
            const isCurrent = activeDay === day;
            const count = timetable.filter((t) => t.dayOfWeek === day).length;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{day}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isCurrent ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots List for selected day */}
      <div className="space-y-3">
        {slotsForDay.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
            No scheduled classes for {activeDay}. Enjoy your study day!
          </div>
        ) : (
          slotsForDay.map((slot) => (
            <div
              key={slot.slotId}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="w-24 text-center py-2 px-1 bg-indigo-50 rounded-xl text-indigo-700 border border-indigo-100 shrink-0">
                  <div className="text-xs font-extrabold">{slot.startTime}</div>
                  <div className="text-[10px] text-indigo-500 font-medium">{slot.endTime}</div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {slot.subjectCode}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{slot.subjectName}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.teacherName}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.room}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  Lecture / Lab
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
