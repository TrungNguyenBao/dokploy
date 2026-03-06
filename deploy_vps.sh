#!/bin/bash
# Dokploy Deployment Script for VPS

set -e

REPO_URL="https://github.com/TrungNguyenBao/dokploy.git"
APP_DIR="dokploy"

echo "Checking dependencies..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    sudo apt-get update && sudo apt-get install -y git
fi

if [ -d "$APP_DIR" ]; then
    echo "Updating existing repository..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "Cloning repository..."
    git clone "$REPO_URL"
    cd "$APP_DIR"
fi

echo "Starting Dokploy with Docker Compose..."
docker compose up -d --build

echo "Deployment complete! Verify at http://localhost:8080"
docker ps
