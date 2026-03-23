# Deployment Scripts

This directory contains automation scripts for deploying DonorConnect.

## Scripts Overview

### `setup-ec2.sh`
**Purpose**: Initial EC2 instance setup (run once on first EC2 instance)

**What it does:**
- Updates system packages
- Installs Docker and Docker Compose
- Installs required tools (git, curl, etc.)
- Configures Docker for optimal performance
- Creates application directory structure

**Run it:**
```bash
bash scripts/setup-ec2.sh
```

**When to use this:**
- Fresh EC2 instance setup
- One-time before any deployments

---

### `deploy.sh`
**Purpose**: Production deployment script (runs automatically via GitHub Actions)

**What it does:**
- Verifies Docker installation
- Creates/updates docker-compose.yml
- Pulls latest Docker image from GHCR
- Stops old running containers
- Starts new application container
- Waits for health check to pass
- Logs deployment status

**Called by GitHub Actions with:**
```bash
bash scripts/deploy.sh <GITHUB_USERNAME> <IMAGE_TAG>
```

**Environment variables it uses:**
- `DATABASE_URL` - Production database connection string
- `SESSION_SECRET` - Server session signing key
- `OPENAI_API_KEY` - AI features API key (optional)
- `NEXT_PUBLIC_APP_URL` - Application public URL

**When to use this:**
- Automatically via CI/CD (recommended)
- Manually when troubleshooting:
  ```bash
  cd /home/ubuntu/donorconnect
  bash scripts/deploy.sh your-github-username latest
  ```

---

## Workflow

### Automated (via GitHub Actions)
1. Developer pushes to main → GitHub Actions triggers
2. Tests run in CI/CD pipeline
3. Docker image built and pushed to GHCR
4. GitHub Actions calls `deploy.sh` on EC2
5. Application updates and restarts automatically

### Manual (Emergency)
```bash
ssh -i "key.pem" ubuntu@YOUR_EC2_IP
cd /home/ubuntu/donorconnect
bash scripts/deploy.sh your-github-username latest
```

---

## SSH Configuration

To ease deployments, configure SSH in `~/.ssh/config`:

```
Host donorconnect
    HostName YOUR_EC2_IP
    User ubuntu
    IdentityFile ~/.ssh/your-key.pem
    StrictHostKeyChecking no
```

Then you can simply:
```bash
ssh donorconnect
```

---

## Log Management

View deployment logs:
```bash
ssh donorconnect
cd /home/ubuntu/donorconnect
docker-compose logs -f app
```

View specific errors:
```bash
docker-compose logs app | tail -100
```

---

## Troubleshooting Script Failures

### Script won't run
```bash
# Fix permissions
chmod +x scripts/deploy.sh scripts/setup-ec2.sh

# Try again
bash scripts/deploy.sh username latest
```

### Docker connection fails
```bash
# Restart Docker
sudo systemctl restart docker

# Try deployment again
bash scripts/deploy.sh username latest
```

### Container won't start
```bash
# Check logs
docker-compose logs

# Verify environment variables
docker-compose config

# Manually start for debugging
docker-compose up -d --no-start
docker-compose start
```

---

## Security Notes

- ✅ Scripts don't print secrets to console (safe to logs)
- ✅ Database URL and API keys passed via environment (not hardcoded)
- ✅ SSH key required for EC2 access (GitHub secret protection)
- ✅ All deployment artifacts stored in GHCR (private by default)

---

## Performance Tips

- Use `t3.small` EC2 or larger for production
- GHCR image pull is fast (cached HTTP layers)
- First deployment takes ~5-10 min
- Subsequent deployments take ~2-3 min (only new layers pulled)

---

For detailed setup instructions, see [DEPLOYMENT-SETUP.md](../DEPLOYMENT-SETUP.md)
