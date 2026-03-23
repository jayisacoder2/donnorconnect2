# DonorConnect Deployment Guide

This guide explains how Docker, GitHub Actions CI/CD, and AWS EC2 work together to automatically build, test, and deploy the DonorConnect application.

The deployment pipeline ensures that every time code is pushed to GitHub, the application is automatically tested and deployed without manual server setup.

## Table of Contents

- [System Overview](#1-system-overview)
- [Prerequisites](#2-prerequisites)
- [Docker Architecture](#3-docker-architecture)
- [CI/CD Pipeline](#4-cicd-pipeline)
- [GitHub Secrets Configuration](#5-github-secrets-configuration)
- [EC2 Server Setup](#6-ec2-server-setup)
- [Environment Variables (.env)](#7-environment-variables-env)
- [Deploying the Application](#8-deploying-the-application)
- [Continuous Deployment Workflow](#9-continuous-deployment-workflow)
- [Troubleshooting](#10-troubleshooting)

## 1. System Overview

The application uses a fully automated CI/CD pipeline. When code is pushed to GitHub, the following process occurs:

### Step 1 — Code Push
A developer pushes code to the GitHub repository.

### Step 2 — Build and Test (GitHub Actions)
GitHub Actions automatically:
- Builds the Docker image
- Pushes the image to Docker Hub
- Runs database migrations
- Executes automated tests (unit, integration, E2E)

### Step 3 — Deployment to EC2
If all tests pass and the push is to the main branch:
- GitHub Actions connects to the EC2 server via SSH
- Downloads the latest Docker image
- Runs database migrations
- Seeds the database with initial data
- Starts the application container

This process ensures that only tested code is deployed to production.

## 2. Prerequisites

Before deploying the application, the following services must be configured.

| Requirement | Description |
|-------------|-------------|
| GitHub Account | Hosts the repository and CI/CD workflow |
| AWS EC2 Instance (Amazon Linux 2) | Server where the application runs |
| PostgreSQL Database | Cloud-hosted database (AWS RDS, Neon, or Supabase) |
| OpenAI API Key | Used by the application for AI features |
| EC2 SSH Key (.pem) | Required to securely connect to the server |

### Verify EC2 Access
Confirm that you can connect to the server using SSH:
```bash
ssh -i "YourKey.pem" ec2-user@YOUR_EC2_IP
```

If the connection succeeds, you will see a terminal prompt similar to:
```
[ec2-user@ip-xxx ~]$
```

If connection fails, verify that port 22 (SSH) is open in the EC2 Security Group.

**Note**: For Amazon Linux 2, the default user is `ec2-user`, not `ubuntu`.

## 3. Docker Architecture

Docker is used to package the application and its dependencies into a portable container image. This ensures the application runs consistently across environments.

### Multi-Stage Docker Build
The project uses a two-stage Docker build to reduce the final image size.

#### Stage 1 — Builder
The builder stage installs dependencies and compiles the Next.js application.
Tasks performed in this stage:
- Install Node.js dependencies with pnpm
- Generate the Prisma database client
- Compile the Next.js application

#### Stage 2 — Runner
The runner stage creates a lightweight production container. Only the compiled output and required runtime files are included.

Benefits of this approach:
- Smaller container size
- Faster deployments
- Improved security

### Docker Compose
The application is started using Docker Compose, which defines how the container runs on the EC2 server.

Key configuration elements:
| Setting | Purpose |
|---------|---------|
| image | Docker image pulled from Docker Hub |
| ports | Maps host port 80 to container port 3000 |
| environment | Application environment variables |
| healthcheck | Verifies the application is responding |
| volumes | Database persistence and migrations |

This configuration ensures the application automatically restarts if the container stops.

## 4. CI/CD Pipeline

The CI/CD workflow is defined in:
`.github/workflows/ci-cd.yml`

The pipeline contains two main jobs.

### Job 1 — Build and Test
This job runs on every push to main or pull request.
Steps include:
- Checkout repository code
- Setup Node.js and pnpm
- Install dependencies
- Lint code
- Generate Prisma client
- Run database migrations (test DB)
- Execute unit, client, and integration tests
- Install Playwright browsers
- Run E2E tests

If any test fails, the deployment process stops.

### Job 2 — Deploy to EC2
This job runs only when:
- The Build & Test job succeeds
- The push was made to the main branch

Deployment steps include:
- Connect to EC2 via SSH
- Install Docker and Docker Compose (if not present)
- Clone/update repository
- Pull the latest Docker image
- Update environment variables
- Run database migrations
- Seed the database
- Start the application container
- Verify health check

This ensures the server always runs the latest tested version of the application.

## 5. GitHub Secrets Configuration

Sensitive values are stored in GitHub Secrets to prevent exposure in source code. Secrets are added through: **Repository Settings → Secrets and variables → Actions**

Required secrets:

| Secret Name | Purpose |
|-------------|---------|
| `DOCKER_HUB_USERNAME` | Your Docker Hub username |
| `DOCKER_HUB_TOKEN` | Docker Hub access token |
| `EC2_HOST` | Public IP address of the EC2 server |
| `EC2_USER` | EC2 username (ec2-user for Amazon Linux) |
| `EC2_SSH_KEY` | Full contents of the EC2 .pem private key |
| `DATABASE_URL_PROD` | Production PostgreSQL connection string |
| `SESSION_SECRET` | Random string for session encryption |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `NEXT_PUBLIC_APP_URL` | Production application URL |

## 6. EC2 Server Setup

The EC2 server must allow incoming traffic on required ports. Configure the Security Group with the following rules:

| Type | Port | Purpose |
|------|------|---------|
| SSH | 22 | Remote server access |
| HTTP | 80 | Access the application in a browser |

**Note**: The application runs on port 80 (standard HTTP) and is mapped to container port 3000.

### Creating an EC2 Instance

You can create an EC2 instance using the AWS CLI:

```bash
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --count 1 \
  --instance-type t2.micro \
  --key-name your-key-pair \
  --security-group-ids sg-your-security-group \
  --subnet-id subnet-your-subnet
```

Get the public IP address:
```bash
aws ec2 describe-instances \
  --instance-ids your-instance-id \
  --query 'Reservations[].Instances[].PublicIpAddress' \
  --output text
```

Connect via SSH:
```bash
ssh -i "your-key.pem" ec2-user@YOUR_EC2_IP
```

## 7. Environment Variables (.env)

The application uses a .env file to store sensitive configuration values. The CI/CD pipeline automatically generates this file on the EC2 server using GitHub Secrets.

Example contents:
```
DATABASE_URL=postgresql://username:password@host:5432/donorconnect?sslmode=require
SESSION_SECRET=your-super-secret-session-key-min-32-chars
OPENAI_API_KEY=sk-your-openai-api-key
NEXT_PUBLIC_APP_URL=http://your-ec2-public-ip
NODE_ENV=production
```

The .env file is never committed to GitHub and exists only on the server.

## 8. Deploying the Application

To deploy the application for the first time:

1. Confirm that all GitHub Secrets are configured
2. Verify that ports 22 (SSH) and 80 (HTTP) are open on the EC2 instance
3. Update the repository URL in `scripts/deploy.sh` (replace `YOUR_USERNAME` with your GitHub username)
4. Push code to the main branch

Example:
```bash
git add .
git commit -m "feat: initial deployment setup"
git push origin main
```

Once the pipeline completes successfully, the application will be accessible at:
`http://YOUR_EC2_PUBLIC_IP`

## 9. Continuous Deployment Workflow

After the initial deployment, all updates follow the same automated process. Whenever code is pushed to main:

1. GitHub builds a new Docker image
2. Tests are executed against a test database
3. The image is uploaded to Docker Hub
4. The EC2 server pulls the new image
5. Database migrations are applied
6. The application container restarts with the updated version

This allows developers to deploy updates with a simple Git command.

## 10. Troubleshooting

### Docker Permission Errors
If Docker reports a permission error, ensure the correct Docker context is active:
```bash
docker context use default
```

### Database Connection Errors
Ensure the `DATABASE_URL_PROD` secret points to your production database:
- For AWS RDS: `postgresql://user:pass@rds-host:5432/donorconnect?sslmode=require`
- For Neon: `postgresql://user:pass@neon-host.neon.tech:5432/donorconnect?sslmode=require`

### Application Not Loading
If the container is running but the application fails, check logs on EC2:
```bash
ssh -i "YourKey.pem" ec2-user@YOUR_EC2_IP
cd /opt/donorconnect

docker-compose logs -f app
docker-compose logs -f db
```

### Health Check Failures
Check the application health endpoint:
```bash
curl http://localhost/api/health
```

### Restarting the Application
To restart the container manually:
```bash
docker-compose restart app
```

### Database Issues
Access the database container:
```bash
docker-compose exec db psql -U postgres -d donorconnect
```

Run migrations manually:
```bash
docker-compose exec app npx prisma migrate deploy
```

Reset database (⚠️ **destroys data**):
```bash
docker-compose exec app npx prisma migrate reset
```

### SSH Connection Issues
- Verify security group allows SSH (port 22)
- Check SSH key permissions: `chmod 600 your-key.pem`
- Ensure you're using the correct username (`ec2-user` for Amazon Linux)

### Port Conflicts
If port 80 is already in use:
```bash
sudo netstat -tulpn | grep :80
# Stop conflicting service or modify docker-compose.yml port mapping
```

Please contact your development team if you encounter persistent issues.