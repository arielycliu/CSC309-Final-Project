#!/bin/bash
set -e

echo "Cleaning dependencies..."
npm cache clean --force
rm -rf node_modules package-lock.json

echo "Installing dependencies..."
npm install

npm run build