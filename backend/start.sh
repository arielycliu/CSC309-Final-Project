#!/bin/bash

echo "drop and reset database"
npx prisma migrate reset --force

echo "create migration and apply it"
npx prisma migrate dev --name init

echo "generate schema (optional since we ran dev)"
npx prisma generate

echo "try importing generated schema"
node prisma/client.js

echo "create superuser"
node prisma/createsu.js catis160 cats@mail.utoronto.ca Catsarec00!

echo "seed db"
node prisma/seed.js 