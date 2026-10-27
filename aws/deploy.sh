#!/usr/bin/env bash
# ==============================================================================
# SmartAttend AI - Automated AWS Production Deployment Script
# ==============================================================================
set -e

echo "🚀 Starting SmartAttend AI Deployment to Amazon Web Services..."

# 1. Check prerequisites
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI is required but not installed. Aborting."; exit 1; }
command -v sam >/dev/null 2>&1 || { echo "❌ AWS SAM CLI is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ Node.js / npm is required but not installed. Aborting."; exit 1; }

# 2. Deploy Serverless Backend via AWS SAM
echo "📦 Step 1/3: Building and deploying backend (DynamoDB, Lambda, API Gateway, Cognito)..."
cd aws
sam build
sam deploy --guided --stack-name smartattend-cloud-prod

# Extract outputs from deployed stack
API_URL=$(aws cloudformation describe-stacks --stack-name smartattend-cloud-prod --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name smartattend-cloud-prod --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text)
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name smartattend-cloud-prod --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)

echo "✅ Backend successfully deployed!"
echo "   API Endpoint: $API_URL"
echo "   Cognito User Pool ID: $USER_POOL_ID"
echo "   S3 Frontend Bucket: $BUCKET_NAME"

# 3. Build React Frontend SPA
echo "⚛️ Step 2/3: Building optimized production frontend..."
cd ..
export VITE_API_URL="$API_URL"
export VITE_COGNITO_USER_POOL_ID="$USER_POOL_ID"
npm run build

# 4. Sync Build to Amazon S3 & Invalidate CloudFront
echo "🌐 Step 3/3: Deploying frontend assets to Amazon S3..."
aws s3 sync dist/ "s3://${BUCKET_NAME}/" --delete --cache-control "max-age=31536000,public"
aws s3 cp dist/index.html "s3://${BUCKET_NAME}/index.html" --cache-control "no-cache,no-store,must-revalidate"

echo "🎉 Deployment Complete!"
echo "Your SmartAttend AI platform is live on AWS."
