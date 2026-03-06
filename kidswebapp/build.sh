#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Node.js if it doesn't exist (Render Python environment doesn't have it by default)
if ! command -v node > /dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Build complete."
