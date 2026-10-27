# SmartAttend AI — AWS Serverless Backend Infrastructure

This directory contains the Infrastructure as Code (IaC) and serverless backend code for deploying SmartAttend AI on AWS.

## Files

- `template.yaml`: AWS Serverless Application Model (SAM) CloudFormation template defining:
  - 5 Amazon DynamoDB tables (On-Demand billing mode)
  - 1 Amazon Cognito User Pool + User Pool Client for role-based authentication
  - 1 Amazon API Gateway HTTP API v2 with CORS
  - 1 AWS Lambda function (Python 3.11 runtime)
  - 2 Amazon S3 buckets (Reports vault & Static Frontend Web hosting)
- `lambda_function.py`: Production Python 3.11 Lambda handler supporting:
  - `GET /api/health`
  - `POST /api/sessions/generate-qr`
  - `POST /api/sessions/validate-qr`
  - `POST /api/ai/assistant` (integrated with Google Gemini 3.8 Flash)
- `deploy.sh`: Automated Bash script that builds the backend with SAM, builds the Vite frontend, and synchronizes assets to S3.

## Deployment Instructions

```bash
# Execute automated script
./deploy.sh
```

Or manually:

```bash
sam build
sam deploy --guided --stack-name smartattend-cloud-prod
```
