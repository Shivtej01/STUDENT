import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  Clock,
  Users,
  ShieldCheck,
  RefreshCw,
  StopCircle,
  Play,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

export const TeacherQrSession: React.FC = () => {
  const { currentUser, subjects, enrollments, users, createSession, completeSession, attendanceRecords } = useApp();

  const mySubjects = subjects.filter((s) => s.teacherId === currentUser.userId);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(mySubjects[0]?.subjectId || '');
  const [room, setRoom] = useState<string>('Lab-302 (Turing Hall)');

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentToken, setCurrentToken] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(20);
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedSubject = subjects.find((s) => s.subjectId === selectedSubjectId);

  // Enrolled students count
  const enrolledStudents = enrollments
    .filter((e) => e.subjectId === selectedSubjectId && e.enrollmentStatus === 'enrolled')
    .map((e) => e.studentId);

  // Live attendees for this active session
  const attendees = attendanceRecords.filter((r) => r.sessionId === activeSessionId);

  // Generate rotating QR token every 20s
  const fetchNewToken = async (sessionId: string) => {
    try {
      const res = await fetch('/api/sessions/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          teacherId: currentUser.userId,
        }),
      });
      const data = await res.json();
      if (data.token) {
        setCurrentToken(data.token);
        setCountdown(20);

        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, data.token, {
            width: 260,
            margin: 2,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch new QR token:', err);
    }
  };

  // Start Session
  const handleStartSession = async () => {
    const newSession = createSession({
      subjectId: selectedSubjectId,
      subjectCode: selectedSubject?.subjectCode,
      subjectName: selectedSubject?.subjectName,
      teacherId: currentUser.userId,
      teacherName: currentUser.name,
      sessionDate: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: 'Scheduled (60m)',
      sessionStatus: 'active',
      sessionType: 'qr',
      room,
      totalStudentsEnrolled: enrolledStudents.length,
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
    });

    setActiveSessionId(newSession.sessionId);
    await fetchNewToken(newSession.sessionId);
  };

  // End Session
  const handleEndSession = () => {
    if (activeSessionId) {
      completeSession(activeSessionId);
      setActiveSessionId(null);
      setCurrentToken('');
    }
  };

  // Timer interval for rotating tokens
  useEffect(() => {
    if (!activeSessionId) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchNewToken(activeSessionId);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSessionId]);

  const copyToken = () => {
    if (!currentToken) return;
    navigator.clipboard.writeText(currentToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Dynamic QR Attendance Session
            </h1>
            {activeSessionId && (
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>SESSION LIVE</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Display this secure rotating QR code on classroom projector or smartboard
          </p>
        </div>

        <div>
          {activeSessionId ? (
            <button
              onClick={handleEndSession}
              className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <StopCircle className="w-4 h-4" />
              <span>End & Finalize Session</span>
            </button>
          ) : (
            <button
              onClick={handleStartSession}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Launch Live QR Session</span>
            </button>
          )}
        </div>
      </div>

      {!activeSessionId ? (
        /* Configuration Before Launching */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 max-w-xl mx-auto space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Configure Live QR Session</h2>
              <p className="text-xs text-slate-500">Select course and room to project the dynamic code</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Assigned Course
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-indigo-500 font-medium"
            >
              {mySubjects.map((s) => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.subjectCode} - {s.subjectName} (Threshold: {s.threshold}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Lecture Hall / Lab
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Lab-302 (Turing Hall)"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-indigo-500 font-medium"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1.5 border border-slate-200/80">
            <div className="flex items-center space-x-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Proxy Security Features</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              • QR code automatically changes every <strong>20 seconds</strong> with unpredictable cryptographic nonces.
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              • Static photographs or forwarded screenshots will expire and be rejected by the AWS Lambda verification endpoint.
            </p>
          </div>

          <button
            onClick={handleStartSession}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Start Session Now</span>
          </button>
        </div>
      ) : (
        /* Active Live Session Display (Projector Mode) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* QR Display Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                {selectedSubject?.subjectCode} • {room}
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Refreshes in: <strong className="text-indigo-600 font-mono">{countdown}s</strong>
                </span>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="p-4 bg-white rounded-2xl border-4 border-slate-900 shadow-md">
              <canvas ref={canvasRef} />
            </div>

            {/* Countdown Progress Bar */}
            <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(countdown / 20) * 100}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 max-w-sm">
              Students must open <strong>SmartAttend AI &gt; QR Scanner</strong> on their mobile device to register presence.
            </p>

            {/* Copy Token Button for test/demo convenience */}
            <div className="pt-2">
              <button
                onClick={copyToken}
                className="inline-flex items-center space-x-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Token Copied to Clipboard!' : 'Copy Active Token for Testing'}</span>
              </button>
            </div>
          </div>

          {/* Live Check-in Monitor (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live Attendees</h3>
                  <p className="text-xs text-slate-400">Real-time AWS DynamoDB stream</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-indigo-600">{attendees.length}</span>
                  <span className="text-xs text-slate-400"> / {enrolledStudents.length}</span>
                </div>
              </div>

              {/* Attendee list */}
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                {attendees.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                    <Radio className="w-6 h-6 mx-auto text-indigo-400 animate-pulse" />
                    <p>Awaiting first student scan...</p>
                    <p className="text-[11px] text-slate-400">
                      (Switch to Student view in top nav to scan, or use Simulate Scan)
                    </p>
                  </div>
                ) : (
                  attendees.map((a) => (
                    <div key={a.recordId} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{a.studentName || 'Student'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{a.rollNumber}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        VERIFIED
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleEndSession}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                End Session & Sync Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
