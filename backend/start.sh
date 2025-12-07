#!/bin/bash

echo "drop and reset database"
npx prisma migrate reset --force

echo "create migration and apply it"
npx prisma migrate dev --name init

echo "generate schema (optional since we ran dev)"
npx prisma generate

echo "seed db"
node prisma/seed.js 