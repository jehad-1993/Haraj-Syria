#!/bin/bash
# Commands to push to GitHub manually

echo "🔄 Pushing changes to GitHub..."

# Make sure we're in the right directory
cd /app

# Check current status
git status

# Push the changes
git push https://github.com/jehad-1993/Haraj-Syria.git main

echo "✅ Push completed!"
echo "🌐 Check Vercel dashboard for automatic deployment"