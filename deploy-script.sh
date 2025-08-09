#!/bin/bash

# Haraj Syria Deployment Script
echo "🚀 Starting Haraj Syria deployment to Vercel..."

# Build frontend
echo "📦 Building frontend..."
cd frontend && yarn build
cd ..

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "🔗 Visit: https://haraj-syria.vercel.app"