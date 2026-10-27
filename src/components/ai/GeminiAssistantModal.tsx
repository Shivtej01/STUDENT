import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  standalone?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  standalone = false,
}) => {
  const {
    currentUser,
    studentSummaries,
    overallAttendancePercentage,
    totalClassesHeld,
    totalClassesAttended,
    subjects,
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        currentUser.role === 'student'
          ? `Hello ${currentUser.name}! I am your SmartAttend AI Assistant. I can help you monitor your attendance compliance (minimum 75% requirement), calculate how many future classes you need to attend, simulate safe leave days, and explain your Semester 5 records.`
          : currentUser.role === 'teacher'
          ? `Welcome Dr. ${currentUser.name.split(' ').pop()}! I can analyze your class turnout, identify students at risk of attendance debarment, and summarize departmental trends.`
          : `Welcome Dean ${currentUser.name.split(' ').pop()}! I am equipped to analyze institutional compliance benchmarks across engineering departments.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen && !standalone) return null;

  // Prompt suggestions based on role
  const suggestions =
    currentUser.role === 'student'
      ? [
          'Which subjects are below 75%?',
          'What is my attendance in Digital Electronics?',
          'How many more classes must I attend to reach 80%?',
          'Can I safely take Friday off?',
          'Summarize my attendance this month',
        ]
      : currentUser.role === 'teacher'
      ? [
          'Which students in my assigned classes have low attendance?',
          'Summarize attendance trends for this semester',
          'Give me suggestions to improve Friday class attendance',
        ]
      : [
          'Which departments are below the 75% threshold?',
          'Summarize campus-wide attendance compliance',
        ];

  const handleSendQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      // Build authoritative context restricted to authorized records
      const contextData = {
        userRole: currentUser.role,
        overallPercentage: overallAttendancePercentage,
        totalHeld: totalClassesHeld,
        totalAttended: totalClassesAttended,
        studentStats: studentSummaries.map((s) => ({
          subjectCode: s.subject.subjectCode,
          subjectName: s.subject.subjectName,
          percentage: s.percentage,
          held: s.totalHeld,
          attended: s.attended,
          classesNeeded: s.classesNeededForTarget,
          canMiss: s.classesCanMiss,
        })),
        subjects: subjects.map((s) => ({
          subjectCode: s.subjectCode,
          subjectName: s.subjectName,
          threshold: s.threshold,
        })),
      };

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          user: currentUser,
          contextData,
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'assistant',
        text: data.answer || 'I could not generate an answer at this time.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          sender: 'assistant',
          text: `Error connecting to AI assistant: ${errorMsg}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = standalone
    ? 'bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[calc(100vh-10rem)]'
    : 'fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200';

  return (
    <>
      {/* Backdrop for modal mode */}
      {!standalone && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <div className={containerClasses}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-bold text-slate-900">SmartAttend AI Assistant</h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Authoritative Attendance Intelligence</p>
            </div>
          </div>

          {!standalone && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-indigo-50/50 border-b border-indigo-100/60 overflow-x-auto flex space-x-2 shrink-0">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSendQuery(sug)}
              className="text-[11px] font-medium bg-white hover:bg-indigo-50 text-indigo-900 px-3 py-1 rounded-full border border-indigo-200/80 transition-colors shrink-0 shadow-2xs"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-2.5 ${
                m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {m.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <div
                  className={`mt-1.5 flex items-center justify-between text-[10px] ${
                    m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {m.source && (
                    <span className="font-mono text-[9px] uppercase tracking-wider">
                      [{m.source}]
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-indigo-600 p-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Grounded Gemini model synthesizing response from attendance engine...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(inputQuery);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask about your attendance, subjects below 75%, target calculations..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-indigo-500 font-medium placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Answers grounded in deterministic backend calculation. No hall ticket data modified.</span>
          </p>
        </div>
      </div>
    </>
  );
};
