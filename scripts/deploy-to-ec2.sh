#!/bin/bash

# DonorConnect EC2 Deployment Script
# Usage: bash scripts/deploy-to-ec2.sh

set -e

# Configuration from your proctor
KEY_NAME="MyKeyPair"
***REMOVED***
***REMOVED***
***REMOVED***
INSTANCE_TYPE="t2.micro"
REGION="us-east-1"
KEY_PATH="$HOME/.ssh/${KEY_NAME}.pem"

echo "🚀 DonorConnect AWS EC2 Deployment"
echo "=================================="

# Step 1: Create key pair if it doesn't exist
if [ ! -f "$KEY_PATH" ]; then
    echo "📝 Creating key pair: $KEY_NAME..."
    aws ec2 create-key-pair \
        --key-name "$KEY_NAME" \
        --region "$REGION" \
        --query 'KeyMaterial' \
        --output text > "$KEY_PATH"
    
    chmod 400 "$KEY_PATH"
    echo "✅ Key pair created at: $KEY_PATH"
else
    echo "✅ Key pair already exists at: $KEY_PATH"
fi

# Step 2: Launch EC2 instance
echo ""
echo "🚀 Launching EC2 instance..."
INSTANCE_JSON=$(aws ec2 run-instances \
    --image-id "$AMI_ID" \
    --count 1 \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$SECURITY_GROUP_ID" \
    --subnet-id "$SUBNET_ID" \
    --region "$REGION" \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=DonorConnect}]' \
    --output json)

INSTANCE_ID=$(echo "$INSTANCE_JSON" | jq -r '.Instances[0].InstanceId')
echo "✅ Instance launched: $INSTANCE_ID"

# Step 3: Wait for instance to be running
echo ""
echo "⏳ Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$REGION"
echo "✅ Instance is running"

# Step 4: Get public DNS
echo ""
echo "⏳ Waiting for public DNS to be assigned..."
sleep 10

PUBLIC_DNS=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --region "$REGION" \
    --query 'Reservations[0].Instances[0].PublicDnsName' \
    --output text)

echo "✅ Public DNS: $PUBLIC_DNS"

# Step 5: Wait for SSH to be available
echo ""
echo "⏳ Waiting for SSH to be available..."
for i in {1..30}; do
    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i "$KEY_PATH" "ubuntu@$PUBLIC_DNS" "echo 'SSH ready'" 2>/dev/null; then
        echo "✅ SSH is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ SSH connection timed out after 30 attempts"
        exit 1
    fi
    echo "  Attempt $i/30..."
    sleep 5
done

# Step 6: Display connection information
echo ""
echo "=================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=================================="
echo ""
echo "📌 Connection Information:"
echo "   Instance ID: $INSTANCE_ID"
echo "   Public DNS: $PUBLIC_DNS"
echo "   Key Path: $KEY_PATH"
echo ""
echo "🔐 Connect to your instance:"
echo "   ssh -i \"$KEY_PATH\" ubuntu@$PUBLIC_DNS"
echo ""
echo "📦 Next steps (run these commands on the EC2 instance):"
echo "   1. Clone repository: git clone <your-repo-url>"
echo "   2. Run setup: bash /path/to/scripts/setup-ec2-instance.sh"
echo ""

# Step 7: Save connection details
cat > "ec2-connection-info.txt" << EOF
DonorConnect EC2 Instance Details
=================================
Instance ID: $INSTANCE_ID
Public DNS: $PUBLIC_DNS
Key Path: $KEY_PATH
Region: $REGION

SSH Command:
ssh -i "$KEY_PATH" ubuntu@$PUBLIC_DNS

Reset key permissions if needed:
chmod 400 "$KEY_PATH"
EOF

echo "💾 Connection details saved to: ec2-connection-info.txt"
echo ""
