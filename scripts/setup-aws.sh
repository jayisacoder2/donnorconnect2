#!/bin/bash

# DonorConnect AWS EC2 Setup Script
# Automates creation of EC2 instance, key pair, and security group
# Usage: bash scripts/setup-aws.sh

set -e

# Configuration
KEY_NAME="donorconnect-key"
SG_NAME="donorconnect-sg"
SG_DESCRIPTION="Security group for DonorConnect application"
INSTANCE_TYPE="t3.small"

# Region selection (default: us-east-1, override with: bash setup-aws.sh eu-west-1)
REGION="${1:-us-east-1}"

# Ubuntu 24.04 LTS AMI IDs by region
declare -A AMI_MAP=(
    ["us-east-1"]="ami-0c55b159cbfafe1f0"
    ["us-west-1"]="ami-0d382e80be7ffdae5"
    ["us-west-2"]="ami-0efcece6bed30fd98"
    ["ca-central-1"]="ami-0c9bfc21ac5bf10eb"
    ["eu-west-1"]="ami-0dad359ff462124ca"
    ["ap-southeast-1"]="ami-047bb4163c506cd98"
)

AMI_ID="${AMI_MAP[$REGION]:-ami-0c55b159cbfafe1f0}"
INSTANCE_NAME="donorconnect"

echo "=========================================="
echo "DonorConnect AWS EC2 Setup"
echo "=========================================="
echo "Region: $REGION"
echo "Instance Type: $INSTANCE_TYPE"
echo "Key Name: $KEY_NAME"
echo "Security Group: $SG_NAME"
echo "=========================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed."
    echo "Please install it: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials are not configured."
    echo "Run: aws configure"
    exit 1
fi

echo "✅ AWS CLI configured"

# Step 1: Check if key pair exists
if aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region "$REGION" &> /dev/null; then
    echo "⚠️  Key pair '$KEY_NAME' already exists. Skipping key creation."
else
    echo "📝 Creating key pair '$KEY_NAME'..."
    aws ec2 create-key-pair \
        --key-name "$KEY_NAME" \
        --region "$REGION" \
        --query 'KeyMaterial' \
        --output text > "${KEY_NAME}.pem"
    chmod 400 "${KEY_NAME}.pem"
    echo "✅ Key pair created: ${KEY_NAME}.pem"
fi

# Step 2: Create security group
echo "🔒 Creating security group '$SG_NAME'..."
SG_ID=$(aws ec2 create-security-group \
    --group-name "$SG_NAME" \
    --description "$SG_DESCRIPTION" \
    --region "$REGION" \
    --query 'GroupId' \
    --output text 2>/dev/null || echo "")

if [ -z "$SG_ID" ]; then
    echo "⚠️  Security group '$SG_NAME' already exists. Retrieving ID..."
    SG_ID=$(aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=$SG_NAME" \
        --region "$REGION" \
        --query 'SecurityGroups[0].GroupId' \
        --output text)
fi

echo "✅ Security Group ID: $SG_ID"

# Step 3: Add inbound rules
echo "📋 Adding inbound rules to security group..."

# SSH (port 22)
aws ec2 authorize-security-group-ingress \
    --group-id "$SG_ID" \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0 \
    --region "$REGION" 2>/dev/null || echo "⚠️  SSH rule already exists"

# HTTP (port 80)
aws ec2 authorize-security-group-ingress \
    --group-id "$SG_ID" \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region "$REGION" 2>/dev/null || echo "⚠️  HTTP rule already exists"

# HTTPS (port 443)
aws ec2 authorize-security-group-ingress \
    --group-id "$SG_ID" \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region "$REGION" 2>/dev/null || echo "⚠️  HTTPS rule already exists"

# App port 3000
aws ec2 authorize-security-group-ingress \
    --group-id "$SG_ID" \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0 \
    --region "$REGION" 2>/dev/null || echo "⚠️  Port 3000 rule already exists"

echo "✅ Inbound rules configured"

# Step 4: Launch EC2 instance
echo "🚀 Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "$AMI_ID" \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$SG_ID" \
    --region "$REGION" \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "✅ Instance launched: $INSTANCE_ID"

# Step 5: Wait for instance to be running
echo "⏳ Waiting for instance to be in 'running' state..."
aws ec2 wait instance-running \
    --instance-ids "$INSTANCE_ID" \
    --region "$REGION"

echo "✅ Instance is running"

# Step 6: Get public IP
echo "📍 Retrieving public IP address..."
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --region "$REGION" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo "✅ Public IP: $PUBLIC_IP"

# Step 7: Display summary
echo ""
echo "=========================================="
echo "✅ EC2 Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Instance Details:"
echo "  Instance ID: $INSTANCE_ID"
echo "  Public IP: $PUBLIC_IP"
echo "  Security Group: $SG_ID"
echo "  Key File: ${KEY_NAME}.pem"
echo "  Region: $REGION"
echo ""
echo "🔐 Next Steps:"
echo "1. Add these GitHub Secrets:"
echo "   - EC2_HOST: $PUBLIC_IP"
echo "   - EC2_USER: ubuntu"
echo "   - EC2_SSH_KEY: (contents of ${KEY_NAME}.pem)"
echo "   - EC2_PROJECT_PATH: /home/ubuntu"
echo ""
echo "2. SSH into the instance:"
echo "   ssh -i ${KEY_NAME}.pem ubuntu@$PUBLIC_IP"
echo ""
echo "3. Initialize the server:"
echo "   cd ~"
echo "   git clone https://github.com/jayisacoder2/donnorconnect2.git donorconnect"
echo "   cd donorconnect"
echo "   bash scripts/setup-ec2.sh"
echo ""
echo "=========================================="
