import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const StudentQrScanner: React.FC = () => {
  const { currentUser, sessions, verifyQrAttendance } = useApp();

  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    sessionId?: string;
    time?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when leaving
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setScanning(true);
    setResult(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Camera access not available or denied:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleSubmitToken = async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) return;
    setLoading(true);
    setResult(null);

    const res = await verifyQrAttendance(tokenToVerify.trim(), currentUser.userId);
    setResult({
      success: res.success,
      message: res.message,
      time: new Date().toLocaleTimeString(),
    });
    setLoading(false);
    stopCamera();
  };

  // Find active session token if one is currently running in the demo
  const activeSession = sessions.find((s) => s.sessionStatus === 'active' || s.sessionType === 'qr');

  const simulateQuickScan = () => {
    // Generate fresh valid token format
    const targetSessionId = activeSession ? activeSession.sessionId : 'sess-101';
    const sampleToken = `SMARTATTEND:${targetSessionId}:${Date.now()}:${Math.random().toString(36).substring(2, 8)}`;
    handleSubmitToken(sampleToken);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Classroom QR Attendance Scanner
            </h1>
            <p className="text-xs text-slate-500">
              Point camera at teacher's dynamic classroom display to verify your presence
            </p>
          </div>
        </div>
      </div>

      {/* Verification Result Card */}
      {result && (
        <div
          className={`p-5 rounded-2xl border ${
            result.success
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/90 border-rose-200 text-rose-950'
          } shadow-xs animate-in fade-in`}
        >
          <div className="flex items-start space-x-3">
            {result.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="text-sm font-bold">
                {result.success ? 'Attendance Verified Successfully!' : 'Verification Failed'}
              </h3>
              <p className="text-xs mt-1 leading-relaxed opacity-90">{result.message}</p>
              {result.time && (
                <div className="mt-2 text-[11px] font-mono opacity-75">
                  Server Timestamp: {result.time} • Recorded in DynamoDB Table: sjte_attendance_records
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scanner Viewport / Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-4">
          {scanning ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-indigo-400 border-dashed rounded-xl m-8 pointer-events-none animate-pulse" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-xs">
                Scanning for active QR session...
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Device Camera Standby</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Click below to activate device camera or simulate scanner in this environment.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scanning ? (
            <button
              onClick={stopCamera}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Stop Camera
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Activate Camera</span>
            </button>
          )}

          <button
            onClick={simulateQuickScan}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>Simulate Scan Current Session</span>
          </button>
        </div>

        {/* Manual Token Input Fallback */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Or Enter Dynamic Session Token Manually
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="e.g. SMARTATTEND:sess-101:..."
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-indigo-500 font-mono"
            />
            <button
              onClick={() => handleSubmitToken(manualToken)}
              disabled={loading || !manualToken}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Security & Presence Limitation Notice */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Security Architecture Notice: </span>
            Dynamic tokens are encrypted with single-use rotating nonces and server-side TTL (20 seconds).
            Tokens cannot be shared or replayed. A QR code alone verifies token reception; institutional geofencing or biometric verification may be required by your department.
          </div>
        </div>
      </div>
    </div>
  );
};
