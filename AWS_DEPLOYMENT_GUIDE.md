# SmartAttend AI — Complete AWS Deployment Guide

This guide provides end-to-end instructions for deploying the **SmartAttend AI** Attendance Management Platform to **Amazon Web Services (AWS)**.

The project supports two main production deployment strategies:
1. **Serverless Architecture (Recommended)**: AWS SAM / CloudFormation with AWS Lambda (Python 3.11), Amazon DynamoDB (On-Demand), Amazon API Gateway HTTP API v2, Amazon Cognito User Pools, and Amazon S3 + CloudFront.
2. **Containerized Architecture (AWS App Runner / ECS Fargate)**: Dockerized Node.js/Express + Vite SPA fullstack container with automatic SSL and zero-infrastructure management.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │        DNS & Edge Distribution       │
                      │ Amazon Route 53 + CloudFront (CDN)   │
                      └──────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
     ┌────────────────────────┐                     ┌────────────────────────┐
     │  Amazon S3 (SPA Dist)  │                     │ Amazon API Gateway v2  │
     │ React + Tailwind Frontend                    │ HTTP API + CORS + JWT  │
     └────────────────────────┘                     └────────────┬───────────┘
                                                                 │
                                                                 ▼
                                                    ┌────────────────────────┐
                                                    │ AWS Lambda (Python 3.11│
                                                    │ Core Engine + AI Proxy │
                                                    └────────────┬───────────┘
                                                                 │
              ┌───────────────────────────┬──────────────────────┴───────┐
              ▼                           ▼                              ▼
  ┌───────────────────────┐   ┌───────────────────────┐     ┌───────────────────────┐
  │   Amazon DynamoDB     │   │ Amazon Cognito Pools  │     │   Google Gemini API   │
  │ • Users Table         │   │ • Student Auth        │     │ Gemini 3.8 Flash for  │
  │ • Subjects Table      │   │ • Teacher Auth        │     │ Predictive Attendance │
  │ • Sessions Table      │   │ • Admin RBAC          │     │ & Compliance Engine   │
  │ • Attendance Records  │   └───────────────────────┘     └───────────────────────┘
  │ • Audit Logs          │
  └───────────────────────┘
```

---

## Method 1: Serverless Deployment (AWS SAM + S3 + CloudFront)

This method uses the infrastructure-as-code files provided in `/aws`:
- `aws/template.yaml`: CloudFormation / SAM template defining DynamoDB tables, Lambda, S3 buckets, Cognito, and API Gateway.
- `aws/lambda_function.py`: Python 3.11 backend handler for QR generation, QR token validation, DynamoDB transactions, and Gemini assistant integration.
- `aws/deploy.sh`: Automated build and deployment script.

### Prerequisites

1. **AWS CLI** (v2+): Installed and configured with permissions for CloudFormation, Lambda, DynamoDB, S3, Cognito, and API Gateway.
   ```bash
   aws --version
   aws configure
   ```
2. **AWS SAM CLI**: Installed (`sam --version`).
3. **Node.js** (v20+ or v22+) & **npm**: Installed.
4. **Google Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com/).

### Step-by-Step Deployment

#### Step 1: Clone & Configure Environment

```bash
git clone <your-repo-url>
cd smartattend-ai
cp .env.example .env
```

#### Step 2: Run the Automated Deployment Script

Make `aws/deploy.sh` executable and run it:

```bash
chmod +x aws/deploy.sh
./aws/deploy.sh
```

#### Step 3: Manual Step-by-Step with AWS SAM (Alternative to Script)

If you prefer executing each command manually:

```bash
# 1. Build serverless backend
cd aws
sam build

# 2. Deploy serverless stack (interactive prompt)
sam deploy --guided \
  --stack-name smartattend-cloud-prod \
  --parameter-overrides Environment=prod GeminiApiKey="YOUR_GEMINI_API_KEY"

# 3. Retrieve stack outputs
API_URL=$(aws cloudformation describe-stacks \
  --stack-name smartattend-cloud-prod \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)

BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name smartattend-cloud-prod \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text)

USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name smartattend-cloud-prod \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)

echo "Backend live at: $API_URL"
echo "Cognito User Pool: $USER_POOL_ID"

# 4. Build Frontend with Production API URL
cd ..
export VITE_API_URL="$API_URL"
export VITE_COGNITO_USER_POOL_ID="$USER_POOL_ID"
npm run build

# 5. Sync Assets to Amazon S3
aws s3 sync dist/ "s3://${BUCKET_NAME}/" --delete --cache-control "max-age=31536000,public"
aws s3 cp dist/index.html "s3://${BUCKET_NAME}/index.html" --cache-control "no-cache,no-store,must-revalidate"
```

---

## Method 2: Containerized Deployment (AWS App Runner)

AWS App Runner provides managed container execution with built-in auto-scaling, load balancing, and HTTPS SSL certificates without managing EC2 instances.

### Step 1: Build & Test Docker Image Locally

```bash
# Build Docker image
docker build -t smartattend-ai:latest .

# Run container locally on port 3000
docker run -p 3000:3000 \
  -e GEMINI_API_KEY="YOUR_GEMINI_API_KEY" \
  smartattend-ai:latest
```

Verify in browser at `http://localhost:3000`.

### Step 2: Push Image to Amazon ECR (Elastic Container Registry)

```bash
# 1. Authenticate Docker to your AWS ECR registry
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# 2. Create ECR repository (if not exists)
aws ecr create-repository --repository-name smartattend-ai --region us-east-1

# 3. Tag and push image
docker tag smartattend-ai:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/smartattend-ai:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/smartattend-ai:latest
```

### Step 3: Create AWS App Runner Service

You can create the service via AWS Management Console or AWS CLI:

```bash
aws apprunner create-service \
  --service-name smartattend-ai-service \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/smartattend-ai:latest",
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
  }'
```

---

## Method 3: AWS Amplify Hosting (Web Frontend Git CI/CD)

For fast web deployment connected to GitHub:
1. Open the [AWS Amplify Console](https://console.aws.amazon.com/amplify).
2. Click **Host web app** and connect your GitHub repository.
3. Set build settings (`amplify.yml`):
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
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
   ```
4. Under **Environment variables**, add:
   - `GEMINI_API_KEY`
   - `VITE_API_URL` (Points to your AWS API Gateway or App Runner endpoint)
5. Click **Save and deploy**.

---

## DynamoDB Table Configuration Summary

The application utilizes 5 DynamoDB tables with On-Demand (`PAY_PER_REQUEST`) capacity mode:

| Table Name | Partition Key (PK) | Sort Key (SK) | Global Secondary Indexes (GSI) | Purpose |
|------------|--------------------|---------------|--------------------------------|---------|
| `smartattend_users_prod` | `userId` (S) | `role` (S) | `EmailIndex` (`email`), `DepartmentRoleIndex` (`departmentId`, `role`) | User directory & credentials |
| `smartattend_subjects_prod` | `subjectId` (S) | `departmentId` (S) | `TeacherSubjectsIndex` (`teacherId`) | Course curriculum & credits |
| `smartattend_sessions_prod` | `sessionId` (S) | `sessionDate` (S) | `SubjectSessionsIndex` (`subjectId`, `sessionDate`) | Class sessions & dynamic QR tokens |
| `smartattend_records_prod` | `sessionId` (S) | `studentId` (S) | `StudentAttendanceIndex` (`studentId`, `markedAt`) | Immutable attendance records |
| `smartattend_audit_logs_prod` | `auditId` (S) | `timestamp` (S) | None | Administrative audit trail |

---

## Security Best Practices for AWS Production

1. **Store Secrets in AWS Secrets Manager**: Never commit API keys or database credentials to git. Use AWS Secrets Manager or Systems Manager Parameter Store.
2. **DynamoDB Point-in-Time Recovery (PITR)**: Enabled in SAM template to protect against accidental record deletion.
3. **CloudFront Origin Access Control (OAC)**: Prevent direct public reads from S3; force all traffic through CloudFront with HTTPS SSL.
4. **Cognito RBAC**: User roles (`student`, `teacher`, `admin`) are stored in Cognito custom user attributes and validated via JWT claims in API Gateway.
5. **CORS Headers**: API Gateway HTTP API configured with restricted AllowedOrigins matching your CloudFront or custom domain.

---

## Verification & Health Check

After deployment, test your endpoints:

```bash
# Health check
curl -X GET "https://<your-api-gateway-id>.execute-api.us-east-1.amazonaws.com/api/health"

# Test Dynamic QR Token Generation
curl -X POST "https://<your-api-gateway-id>.execute-api.us-east-1.amazonaws.com/api/sessions/generate-qr" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "SES_DEMO_01", "teacherId": "USR_TEA_01"}'
```
