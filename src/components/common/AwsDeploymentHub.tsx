import React, { useState } from 'react';
import {
  Rocket,
  Server,
  Cloud,
  Terminal,
  Database,
  Shield,
  Layers,
  Cpu,
  Check,
  Copy,
  ExternalLink,
  HardDrive,
  Activity,
  DollarSign,
  AlertCircle,
  FileCode,
  Box,
  Globe,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AwsDeploymentHubProps {
  standalone?: boolean;
  onClose?: () => void;
  defaultTab?: 'sam' | 'apprunner' | 'amplify' | 'architecture' | 'cost';
}

export const AwsDeploymentHub: React.FC<AwsDeploymentHubProps> = ({
  standalone = false,
  onClose,
  defaultTab = 'amplify',
}) => {
  const { config } = useApp();
  const [activeTab, setActiveTab] = useState<'sam' | 'apprunner' | 'amplify' | 'architecture' | 'cost'>(defaultTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ status: string; data?: any } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const runLiveHealthCheck = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setTestResult({ status: 'success', data });
    } catch (err: any) {
      setTestResult({ status: 'error', data: err?.message || 'Failed to ping health endpoint' });
    } finally {
      setIsTesting(false);
    }
  };

  const samDeployScript = `#!/usr/bin/env bash
# ==============================================================================
# SmartAttend AI - Automated AWS Production Deployment Script
# ==============================================================================
set -e

echo "🚀 Starting SmartAttend AI Deployment to Amazon Web Services..."

# 1. Check prerequisites
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI is required but not installed."; exit 1; }
command -v sam >/dev/null 2>&1 || { echo "❌ AWS SAM CLI is required."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required."; exit 1; }

# 2. Deploy Serverless Backend via AWS SAM
echo "📦 Step 1/3: Deploying DynamoDB, Lambda (Python 3.11), API Gateway & Cognito..."
cd aws
sam build
sam deploy --guided --stack-name smartattend-cloud-prod

# 3. Extract outputs from deployed stack
API_URL=$(aws cloudformation describe-stacks --stack-name smartattend-cloud-prod --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name smartattend-cloud-prod --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text)
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name smartattend-cloud-prod --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)

echo "✅ Backend successfully deployed to: $API_URL"

# 4. Build React Frontend SPA
echo "⚛️ Step 2/3: Building production frontend..."
cd ..
export VITE_API_URL="$API_URL"
export VITE_COGNITO_USER_POOL_ID="$USER_POOL_ID"
npm run build

# 5. Sync Build to Amazon S3
echo "🌐 Step 3/3: Deploying frontend assets to Amazon S3..."
aws s3 sync dist/ "s3://\${BUCKET_NAME}/" --delete --cache-control "max-age=31536000,public"
aws s3 cp dist/index.html "s3://\${BUCKET_NAME}/index.html" --cache-control "no-cache,no-store,must-revalidate"

echo "🎉 Deployment Complete! Your SmartAttend AI platform is live on AWS."`;

  const appRunnerDockerScript = `# 1. Authenticate Docker with Amazon ECR
aws ecr get-login-password --region us-east-1 | \\
  docker login --username AWS --password-stdin <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# 2. Create ECR repository for the container
aws ecr create-repository --repository-name smartattend-ai --region us-east-1

# 3. Build & tag Docker container locally
docker build -t smartattend-ai:latest .
docker tag smartattend-ai:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/smartattend-ai:latest

# 4. Push to Amazon ECR
docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/smartattend-ai:latest

# 5. Deploy directly on AWS App Runner with auto-scaling & HTTPS
aws apprunner create-service \\
  --service-name smartattend-ai-service \\
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "<YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/smartattend-ai:latest",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": [
          {"Name": "GEMINI_API_KEY", "Value": "YOUR_GEMINI_API_KEY"},
          {"Name": "NODE_ENV", "Value": "production"}
        ]
      },
      "ImageRepositoryType": "ECR"
    },
    "AutoDeploymentsEnabled": true
  }'`;

  const amplifyYaml = `version: 1
frontend:
  phases:
    preBuild:
      commands:
        - node -v
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - ~/.npm/**/*`;

  const spaRedirectRule = `[
  {
    "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>",
    "target": "/index.html",
    "status": "200 (Rewrite)"
  }
]`;

  const amplifyCliScript = `# 1. Install AWS Amplify CLI globally
npm install -g @aws-amplify/cli

# 2. Configure AWS Profile credentials
amplify configure

# 3. Add Hosting to your project
amplify add hosting
# Select: Hosting with Amplify Console (Continuous deployment or manual)

# 4. Build and publish directly to AWS Amplify global edge CDN
npm run build
amplify publish`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center space-x-1">
                <Cloud className="w-3 h-3" />
                <span>AWS Cloud Production Center</span>
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-slate-300 text-xs font-mono">Region: us-east-1 / ap-south-1</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Deploy SmartAttend AI on Amazon Web Services
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Step-by-step production guides, one-click CLI deployment scripts, and infrastructure configurations for DynamoDB, Lambda Python 3.11, API Gateway, and Docker containers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={runLiveHealthCheck}
              disabled={isTesting}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Verify Health Endpoint</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Close Guide
              </button>
            )}
          </div>
        </div>

        {/* Live health test feedback */}
        {testResult && (
          <div className="mt-4 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>AWS Health Status: {testResult.data?.status || 'Active'}</span>
            </div>
            <pre className="text-slate-300 text-[11px] overflow-x-auto max-h-32">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('sam')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'sam'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Option 1: Serverless (SAM + Lambda + DynamoDB)</span>
        </button>

        <button
          onClick={() => setActiveTab('apprunner')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'apprunner'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Option 2: Container (AWS App Runner / ECS)</span>
        </button>

        <button
          onClick={() => setActiveTab('amplify')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'amplify'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Option 3: AWS Amplify (Git CI/CD)</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Architecture &amp; IAM Security</span>
        </button>

        <button
          onClick={() => setActiveTab('cost')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'cost'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Cost &amp; Free Tier Estimator</span>
        </button>
      </div>

      {/* Tab 1: Serverless SAM */}
      {activeTab === 'sam' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Automated Deployment via AWS SAM CLI &amp; Bash Script
                </h2>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Recommended for Zero-Idle Cost
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This repository includes a production-ready SAM template (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-bold">aws/template.yaml</code>) and Python 3.11 Lambda handler (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-bold">aws/lambda_function.py</code>) that automatically sets up 5 DynamoDB tables with On-Demand billing, Cognito User Pools, and API Gateway HTTP API v2.
            </p>

            {/* Quick 3-step cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="font-bold text-slate-900">Configure AWS CLI</h4>
                <p className="text-slate-500 text-[11px]">
                  Run <code className="font-mono text-slate-800 font-bold">aws configure</code> with an IAM user that has CloudFormation, Lambda, and DynamoDB rights.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="font-bold text-slate-900">Run Deploy Script</h4>
                <p className="text-slate-500 text-[11px]">
                  Execute <code className="font-mono text-slate-800 font-bold">./aws/deploy.sh</code> to build the SAM backend, compile Vite SPA, and sync to S3.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="font-bold text-slate-900">Access Live URL</h4>
                <p className="text-slate-500 text-[11px]">
                  CloudFormation outputs your CloudFront CDN URL and API Gateway endpoint URL in under 3 minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Copyable bash script block */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-md p-6 space-y-3 font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-sans">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                <FileCode className="w-4 h-4" />
                <span>Script: aws/deploy.sh</span>
              </div>
              <button
                onClick={() => copyCode(samDeployScript, 'deploy-sh')}
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] transition-colors"
              >
                {copiedId === 'deploy-sh' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === 'deploy-sh' ? 'Copied!' : 'Copy Shell Script'}</span>
              </button>
            </div>

            <pre className="overflow-x-auto text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96">
              {samDeployScript}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Container (App Runner) */}
      {activeTab === 'apprunner' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Box className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Deploy as a Container on AWS App Runner or ECS Fargate
                </h2>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                Full-Stack Node.js + Express
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Prefer containers? The included multi-stage <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-bold">Dockerfile</code> packages the Express backend (<code className="font-mono">server.ts</code>) and compiled Vite frontend into an alpine container ready for AWS App Runner.
            </p>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Why AWS App Runner?</span>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  App Runner automatically allocates load balancers, issues free AWS Certificate Manager SSL/TLS certificates, provisions compute instances, and handles rolling zero-downtime updates from Amazon ECR.
                </p>
              </div>
            </div>
          </div>

          {/* Docker & ECR Commands */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-md p-6 space-y-3 font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-sans">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>Docker &amp; AWS ECR Push Commands</span>
              </div>
              <button
                onClick={() => copyCode(appRunnerDockerScript, 'docker-ecr')}
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] transition-colors"
              >
                {copiedId === 'docker-ecr' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === 'docker-ecr' ? 'Copied!' : 'Copy Commands'}</span>
              </button>
            </div>

            <pre className="overflow-x-auto text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96">
              {appRunnerDockerScript}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Amplify Git CI/CD */}
      {activeTab === 'amplify' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Deploy via AWS Amplify Hosting (Continuous Deployment from GitHub)
                </h2>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                Easiest &amp; Fastest Option
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              AWS Amplify connects directly to your Git repository (GitHub, GitLab, Bitbucket, or AWS CodeCommit) and automatically builds and deploys your Vite React application to a high-speed global Content Delivery Network (CloudFront) whenever you push code.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 block">Step 1: Push to Git</span>
                <p className="text-slate-500 text-[11px]">
                  Initialize git and push this repo to GitHub or GitLab. Root <code className="font-mono">amplify.yml</code> is already configured.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 block">Step 2: Connect in Console</span>
                <p className="text-slate-500 text-[11px]">
                  Open AWS Amplify Console &gt; Host web app &gt; select your Git repo and branch <code className="font-mono">main</code>.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 block">Step 3: Env Variables</span>
                <p className="text-slate-500 text-[11px]">
                  Set <code className="font-mono">GEMINI_API_KEY</code> and optional <code className="font-mono">VITE_API_URL</code> under App Settings.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 block">Step 4: Add SPA Rewrite</span>
                <p className="text-slate-500 text-[11px]">
                  Set rewrite rule (<code className="font-mono">&lt;*&gt;</code> to <code className="font-mono">/index.html</code>) under Rewrites and redirects.
                </p>
              </div>
            </div>
          </div>

          {/* Critical SPA Rewrites & Redirects Card */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-100">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Critical: AWS Amplify SPA Rewrites &amp; Redirects Configuration</span>
              </div>
              <button
                onClick={() => copyCode(spaRedirectRule, 'spa-rewrite')}
                className="flex items-center space-x-1.5 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[11px] font-semibold transition-colors"
              >
                {copiedId === 'spa-rewrite' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === 'spa-rewrite' ? 'Copied Rule!' : 'Copy Rewrite Rule'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              In AWS Amplify Console &gt; <strong>App settings</strong> &gt; <strong>Rewrites and redirects</strong>, add this rule so that refreshing direct sub-routes (e.g. <code className="font-mono text-slate-800">/my-attendance</code> or <code className="font-mono text-slate-800">/qr-scanner</code>) redirects cleanly to <code className="font-mono text-slate-800">/index.html</code> with HTTP 200:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto">
              <pre>{spaRedirectRule}</pre>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* amplify.yml */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-md p-6 space-y-3 font-mono text-xs text-slate-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-sans">
                  <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                    <FileCode className="w-4 h-4" />
                    <span>amplify.yml (Build Specification)</span>
                  </div>
                  <button
                    onClick={() => copyCode(amplifyYaml, 'amplify-yml')}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] transition-colors font-sans"
                  >
                    {copiedId === 'amplify-yml' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === 'amplify-yml' ? 'Copied!' : 'Copy YAML'}</span>
                  </button>
                </div>

                <pre className="mt-3 overflow-x-auto text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56">
                  {amplifyYaml}
                </pre>
              </div>

              <p className="text-[10px] text-slate-400 font-sans pt-2 border-t border-slate-800">
                This file already exists in the project root. AWS Amplify detects it automatically.
              </p>
            </div>

            {/* Amplify CLI Option */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-md p-6 space-y-3 font-mono text-xs text-slate-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-sans">
                  <div className="flex items-center space-x-2 text-purple-400 font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>Alternative: Deploy via Amplify CLI</span>
                  </div>
                  <button
                    onClick={() => copyCode(amplifyCliScript, 'amplify-cli')}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] transition-colors font-sans"
                  >
                    {copiedId === 'amplify-cli' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === 'amplify-cli' ? 'Copied!' : 'Copy CLI'}</span>
                  </button>
                </div>

                <pre className="mt-3 overflow-x-auto text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56">
                  {amplifyCliScript}
                </pre>
              </div>

              <p className="text-[10px] text-slate-400 font-sans pt-2 border-t border-slate-800">
                See <code className="text-indigo-400 font-mono">AMPLIFY_DEPLOYMENT_GUIDE.md</code> for complete details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Architecture & Security */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Institutional Security, IAM Policies &amp; DynamoDB Schemas
                </h2>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                FERPA &amp; Audit Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>DynamoDB Tables Provisioned (PAY_PER_REQUEST)</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li>• <strong className="text-slate-800">smartattend_users_prod:</strong> PK=userId, SK=role, GSI=EmailIndex</li>
                  <li>• <strong className="text-slate-800">smartattend_subjects_prod:</strong> PK=subjectId, SK=departmentId, GSI=TeacherSubjectsIndex</li>
                  <li>• <strong className="text-slate-800">smartattend_sessions_prod:</strong> PK=sessionId, SK=sessionDate, GSI=SubjectSessionsIndex</li>
                  <li>• <strong className="text-slate-800">smartattend_records_prod:</strong> PK=sessionId, SK=studentId (Conditional Put preventing duplicate mark)</li>
                  <li>• <strong className="text-slate-800">smartattend_audit_logs_prod:</strong> PK=auditId, SK=timestamp</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Security &amp; IAM Hardening Standards</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li>• <strong>Encryption at Rest:</strong> AES-256 server-side encryption across all S3 buckets and DynamoDB tables.</li>
                  <li>• <strong>Cognito JWT Auth:</strong> API Gateway authorizer verifies role claim before Lambda invocation.</li>
                  <li>• <strong>Origin Access Control (OAC):</strong> S3 bucket blocks all direct public reads; CloudFront CDN only.</li>
                  <li>• <strong>Secrets Management:</strong> Gemini API keys are retrieved securely from AWS Secrets Manager or environment parameters.</li>
                  <li>• <strong>Rotating 20s QR TTL:</strong> Eliminates static barcode sharing and proxy attendance.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Cost & Free Tier */}
      {activeTab === 'cost' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                AWS Free Tier Coverage &amp; Monthly Cost Breakdown
              </h2>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              ~$0.00 / Month (Within Free Tier)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">AWS Service</th>
                  <th className="py-2.5 px-3">AWS Always Free Tier Limit</th>
                  <th className="py-2.5 px-3">SmartAttend AI Consumption</th>
                  <th className="py-2.5 px-3">Estimated Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900">Amazon DynamoDB</td>
                  <td className="py-2.5 px-3 text-slate-600">25 GB storage + 25 WCU / 25 RCU</td>
                  <td className="py-2.5 px-3 text-slate-600">&lt; 100 MB (~10,000 attendance records)</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">$0.00</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900">AWS Lambda</td>
                  <td className="py-2.5 px-3 text-slate-600">1,000,000 free requests/month</td>
                  <td className="py-2.5 px-3 text-slate-600">~25,000 QR scans/month</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">$0.00</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900">Amazon S3</td>
                  <td className="py-2.5 px-3 text-slate-600">5 GB Standard storage</td>
                  <td className="py-2.5 px-3 text-slate-600">&lt; 50 MB frontend build + CSV exports</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">$0.00</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900">Amazon CloudFront</td>
                  <td className="py-2.5 px-3 text-slate-600">1 TB data transfer out/month</td>
                  <td className="py-2.5 px-3 text-slate-600">&lt; 10 GB/month</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">$0.00</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900">Amazon Cognito</td>
                  <td className="py-2.5 px-3 text-slate-600">50,000 MAU (Monthly Active Users)</td>
                  <td className="py-2.5 px-3 text-slate-600">~2,000 students &amp; faculty</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">$0.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              💡 <strong>Takeaway:</strong> Because SmartAttend AI is architected with Serverless pay-per-request and S3 static hosting, typical institutional usage for up to 5,000 students runs comfortably within the <strong>AWS Always-Free Tier</strong>.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
