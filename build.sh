#!/bin/bash
set -e

echo "Installing dependencies..."
cd frontend/app
npm ci

echo "Building application..."
npm run build

echo "Build completed successfully!" 