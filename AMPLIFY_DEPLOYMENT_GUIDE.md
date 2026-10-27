# Deploying SmartAttend AI on AWS Amplify (Complete Step-by-Step Guide)

This guide walks you through deploying **SmartAttend AI** to **AWS Amplify Hosting**. AWS Amplify is the fastest way to host modern Single Page Applications (SPAs) with Git-based continuous deployment (CI/CD), global CDN distribution, automatic SSL certificates, and custom domain mapping.

---

## Architecture with AWS Amplify

```
       ┌────────────────────────┐
       │   GitHub / GitLab /    │
       │    AWS CodeCommit      │
       └───────────┬────────────┘
                   │ (git push triggers automated build)
                   ▼
       ┌────────────────────────┐
       │   AWS Amplify Console  │
       │  • Runs `npm run build`│
       │  • Generates /dist     │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Amazon CloudFront CDN  │
       │  • Free SSL / HTTPS    │
       │  • Global Edge Caching │
       │  • SPA Rewrites (<*>)  │
       └───────────┬────────────┘
                   │
       ┌───────────┴───────────────────────┐
       ▼                                   ▼
┌─────────────────────────┐     ┌────────────────────────┐
│  SmartAttend React SPA  │     │ AWS Backend API (SAM)  │
│  Vite + Tailwind UI     │────▶│ Amazon API Gateway     │
│  Student / Faculty /    │     │ AWS Lambda Python 3.11 │
│  Admin Role Dashboards  │     │ Amazon DynamoDB Tables │
└─────────────────────────┘     └────────────────────────┘
```

---

## Method 1: Deploy via the AWS Amplify Console (Recommended)

### Step 1: Push Your Code to GitHub / GitLab

Initialize git and push this repository to your preferred Git provider:

```bash
git init
git add .
git commit -m "feat: initial commit for SmartAttend AI"
git branch -M main
git remote add origin https://github.com/<your-username>/smartattend-ai.git
git push -u origin main
```

*(Note: The repository already includes `amplify.yml` in the root, so Amplify will automatically detect the build configuration.)*

---

### Step 2: Create a New App in AWS Amplify Console

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/amplify).
2. Make sure you are in your preferred region (e.g., `us-east-1` or `ap-south-1`).
3. Click **Deploy an app** (or **Host web app**).
4. Select your Git provider (e.g., **GitHub**) and click **Next**.
5. Authorize AWS Amplify to access your GitHub account.
6. Select the repository `smartattend-ai` and choose branch `main`.
7. Click **Next**.

---

### Step 3: Configure Build Settings

Amplify will automatically detect the `amplify.yml` file already present in the repository root:

```yaml
version: 1
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
      - ~/.npm/**/*
```

If prompted to edit the build spec, verify that:
- **Base directory** is set to `dist`
- **Build command** is set to `npm run build`

---

### Step 4: Add Environment Variables

In the **Environment variables** section (or later under **App settings** > **Environment variables**), add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/) |
| `VITE_API_URL` | `https://<api-id>.execute-api.us-east-1.amazonaws.com` | (Optional) Deployed AWS Lambda / API Gateway endpoint |
| `_LIVE_UPDATES` | `[{"pkg":"node","type":"nvm","version":"20"}]` | (Recommended) Ensures AWS Amplify uses Node.js 20+ runtime |

Click **Next**, review the configuration, and click **Save and deploy**.

Amplify will now provision an isolated container, install dependencies, run `npm run build`, and deploy the build artifacts to AWS global edge servers.

---

### Step 5: Configure SPA Rewrites & Redirects (CRITICAL)

Because SmartAttend AI is a Single Page Application (SPA) with client-side routing, direct navigation or page refreshes on sub-paths (e.g., `/my-attendance`, `/dashboard`, `/qr-scanner`) must route back to `/index.html`.

1. In the AWS Amplify Console left sidebar, click **Rewrites and redirects** (under **App settings**).
2. Click **Edit**.
3. Add the following rule or modify the default 404 rule:
   - **Source address**: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   - **Target address**: `/index.html`
   - **Type**: `200 (Rewrite)`
4. Click **Save**.

Now, refreshing any page or entering a deep link will load properly without 404 errors!

---

## Method 2: Deploy via AWS Amplify CLI

If you prefer deploying directly from your terminal:

```bash
# 1. Install Amplify CLI globally
npm install -g @aws-amplify/cli

# 2. Configure IAM user credentials
amplify configure

# 3. Initialize Amplify in the project
amplify init
# ? Enter a name for the project: smartattend
# ? Initialize the project with the above configuration? Yes
# ? Select the authentication provider: AWS profile

# 4. Add Hosting
amplify add hosting
# ? Select the plugin module to execute: Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)
# ? Choose a type: Manual deployment (or Continuous deployment with Git)

# 5. Build and Publish
npm run build
amplify publish
```

Amplify will output your live URL (e.g., `https://main.<app-id>.amplifyapp.com`).

---

## Connecting the AWS Serverless Backend (DynamoDB & Lambda)

You have two choices for the backend:

### Choice A: Connect to Deployed AWS SAM Backend
If you ran `aws/deploy.sh` or `sam deploy --guided` as described in `AWS_DEPLOYMENT_GUIDE.md`:
1. Copy the `ApiEndpoint` output from the SAM stack (e.g., `https://abc123xyz.execute-api.us-east-1.amazonaws.com`).
2. In Amplify Console > **App settings** > **Environment variables**, set:
   ```
   VITE_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com
   ```
3. Trigger a redeploy. SmartAttend AI will send all dynamic QR validations and DynamoDB queries to your serverless backend.

### Choice B: Autonomous Standalone Mode
If you want to host SmartAttend AI purely as a high-performance web app with client-side state and direct Gemini AI assistance:
1. Simply deploy to Amplify with `GEMINI_API_KEY`.
2. The platform operates autonomously with deterministic attendance calculators, rotating QR generation, and full role-based dashboard simulation.

---

## Custom Domain Setup

1. In Amplify Console, navigate to **Domain management**.
2. Click **Add domain**.
3. Enter your institutional domain (e.g., `attendance.university.edu`).
4. If your domain is in **Amazon Route 53**, Amplify automatically configures DNS records and issues a free AWS Certificate Manager (ACM) SSL certificate.
5. If using an external registrar (Cloudflare, GoDaddy, Namecheap), copy the provided CNAME verification record into your DNS provider.

---

## Summary Checklist

- [x] `amplify.yml` present in repository root
- [ ] Code pushed to GitHub repository
- [ ] App connected in AWS Amplify Console
- [ ] `GEMINI_API_KEY` set in Environment Variables
- [ ] SPA Rewrite rule configured (`<*>` -> `/index.html`, 200 Rewrite)
- [ ] Deployed and tested live on `*.amplifyapp.com`
