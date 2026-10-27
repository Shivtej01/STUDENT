import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CloudCog,
  Save,
  Server,
  Database,
  Shield,
  HardDrive,
  Activity,
  RefreshCw,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Rocket,
  ExternalLink,
  Cpu,
  Layers,
} from 'lucide-react';

export const AdminSystemSettings: React.FC = () => {
  const { config, updateConfig, resetDemoData } = useApp();

  const [threshold, setThreshold] = useState<number>(config.defaultThresholdPercentage);
  const [lateAllowance, setLateAllowance] = useState<number>(config.lateAllowanceMinutes);
  const [academicYear, setAcademicYear] = useState<string>(config.academicYear);
  const [currentSemester, setCurrentSemester] = useState<string>(config.currentSemester);

  const [activeTab, setActiveTab] = useState<'settings' | 'deploy'>('settings');
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const [cloudWatchLogs, setCloudWatchLogs] = useState<Array<{
    timestamp: string;
    level: string;
    service: string;
    message: string;
  }>>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/aws/cloudwatch-logs');
      const data = await res.json();
      if (data.logs) {
        setCloudWatchLogs(data.logs);
      }
    } catch (err) {
      console.warn('Failed to fetch CloudWatch logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      defaultThresholdPercentage: threshold,
      lateAllowanceMinutes: lateAllowance,
      academicYear,
      currentSemester,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  const samCommands = `# 1. Configure AWS CLI with your IAM credentials
aws configure

# 2. Build the Serverless Application (Python 3.11 Lambda & DynamoDB)
cd aws
sam build

# 3. Deploy to your AWS account (creates S3, CloudFront, Cognito, DynamoDB, API Gateway)
sam deploy --guided \\
  --stack-name smartattend-cloud-prod \\
  --parameter-overrides GeminiApiKey="YOUR_GEMINI_API_KEY_HERE"

# 4. Build the React frontend with the deployed API Gateway endpoint
cd ..
npm run build

# 5. Sync build artifacts to the Amazon S3 frontend bucket
aws s3 sync dist/ s3://smartattend-frontend-YOUR_ACCOUNT_ID-prod/ --delete

# 6. Invalidate CloudFront CDN Cache
aws cloudfront create-invalidation --distribution-id YOUR_CF_DIST_ID --paths "/*"`;

  const samTemplateYaml = `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: SmartAttend AI - AWS Cloud Architecture

Parameters:
  GeminiApiKey:
    Type: String
    NoEcho: true

Resources:
  UsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: smartattend_users_prod
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
      KeySchema:
        - AttributeName: userId
          KeyType: HASH

  AttendanceRecordsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: smartattend_records_prod
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: sessionId
          AttributeType: S
        - AttributeName: studentId
          AttributeType: S
      KeySchema:
        - AttributeName: sessionId
          KeyType: HASH
        - AttributeName: studentId
          KeyType: RANGE

  AttendanceFunction:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: python3.11
      Handler: lambda_function.lambda_handler
      CodeUri: ./
      Environment:
        Variables:
          GEMINI_API_KEY: !Ref GeminiApiKey
      Events:
        ApiGateway:
          Type: HttpApi`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            System Settings &amp; AWS Cloud Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Senate policy parameters, live infrastructure telemetry, and AWS production deployment guides
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Senate Policies &amp; Cloud Telemetry
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'deploy'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>AWS Deployment Hub</span>
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">
            Institutional settings saved. Audit event logged to DynamoDB.
          </span>
        </div>
      )}

      {activeTab === 'settings' ? (
        /* Settings Tab Content */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left (6 cols): Senate Policy Parameters Form */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Senate Academic Policy Configuration</h2>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-bold text-slate-700 uppercase">
                      Mandatory Minimum Attendance Threshold
                    </label>
                    <span className="font-extrabold text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {threshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={90}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Students below this threshold are automatically flagged for exam hall ticket debarment.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Late Arrival Grace Period (Minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={lateAllowance}
                    onChange={(e) => setLateAllowance(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-indigo-500 font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Scans within this window after lecture start are recorded as &ldquo;Late&rdquo; rather than Absent.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Current Semester</label>
                    <input
                      type="text"
                      value={currentSemester}
                      onChange={(e) => setCurrentSemester(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Senate Policies</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right (6 cols): AWS Cloud Infrastructure Specs */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <Server className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">AWS Production Infrastructure</h2>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                      <Database className="w-4 h-4 text-indigo-600" />
                      <span>Amazon DynamoDB</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Prefix: <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">{config.dynamoDbTablePrefix}*</code>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Mode: PAY_PER_REQUEST (On-Demand Capacity) • Point-in-Time Recovery Active
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    HEALTHY
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                      <Activity className="w-4 h-4 text-amber-600" />
                      <span>AWS Lambda (Python 3.11 Runtime)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Handler: attendance_processor.lambda_handler • Concurrency: Auto
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Gateway: Amazon API Gateway HTTP API v2 (JWT Authorizer)
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    CONNECTED
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>Amazon Cognito User Pools</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Pool ID: <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">{config.cognitoUserPoolId}</code>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Groups: students, teachers, administrators • MFA: Optional
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    ACTIVE
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                      <HardDrive className="w-4 h-4 text-emerald-600" />
                      <span>Amazon S3 Document Vault</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Bucket: <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">{config.s3ReportBucket}</code>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Encryption: SSE-KMS • CloudFront Distribution: Enabled
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    ENCRYPTED
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CloudWatch Logs Live Terminal Feed */}
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-md space-y-3 font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>AWS CloudWatch Logs — {config.cloudWatchLogGroup}</span>
              </div>

              <button
                onClick={fetchLogs}
                disabled={loadingLogs}
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh Stream</span>
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 text-[11px]">
              {cloudWatchLogs.length === 0 ? (
                <div className="text-slate-500">No stream events received in current window.</div>
              ) : (
                cloudWatchLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-2 hover:bg-slate-900/50 p-1 rounded">
                    <span className="text-slate-500 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                        log.level === 'INFO'
                          ? 'bg-blue-950 text-blue-400'
                          : log.level === 'WARN'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-indigo-400 shrink-0">[{log.service}]</span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* AWS Deployment Hub Tab Content */
        <div className="space-y-6 animate-in fade-in">
          {/* Architecture Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">AWS Production Cloud Topology</h2>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                Serverless &amp; Auto-Scaling
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 block">1. Edge &amp; CDN</span>
                <p className="text-slate-600 text-[11px]">
                  Amazon CloudFront + Route 53 SSL with OAC securing the Amazon S3 frontend bucket.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 block">2. API Gateway &amp; Auth</span>
                <p className="text-slate-600 text-[11px]">
                  Amazon API Gateway HTTP API v2 with Cognito JWT Authorizer validating role claims.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 block">3. Compute &amp; Gemini AI</span>
                <p className="text-slate-600 text-[11px]">
                  AWS Lambda (Python 3.11) invoking DynamoDB queries and Google Gemini API server-side.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 block">4. Data Persistence</span>
                <p className="text-slate-600 text-[11px]">
                  5 Amazon DynamoDB tables (On-Demand capacity) with point-in-time recovery and S3 audit vaults.
                </p>
              </div>
            </div>
          </div>

          {/* Deployment Steps Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Terminal Commands Guide (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 shadow-md p-6 space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-sans">
                <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                  <Terminal className="w-4 h-4" />
                  <span>Deployment Terminal Commands</span>
                </div>
                <button
                  onClick={() => copyToClipboard(samCommands, 'commands')}
                  className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] transition-colors"
                >
                  {copiedLabel === 'commands' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedLabel === 'commands' ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <pre className="overflow-x-auto text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {samCommands}
              </pre>
            </div>

            {/* SAM IaC Template Preview (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">AWS SAM Template (aws/template.yaml)</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(samTemplateYaml, 'sam')}
                    className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {copiedLabel === 'sam' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLabel === 'sam' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="mt-3 p-3 bg-slate-50 rounded-xl font-mono text-[10px] text-slate-700 max-h-72 overflow-y-auto space-y-1">
                  <pre>{samTemplateYaml}</pre>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                File located at: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">aws/template.yaml</code> &amp; script at <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">aws/deploy.sh</code>.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
