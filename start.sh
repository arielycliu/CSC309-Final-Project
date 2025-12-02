#!/bin/bash
set -e

cd backend
npm run clean
npm install
node index.js 3000

cd frontend
npm run clean
npm install
npm run build
npm run dev
cd ..

