#!/bin/bash

echo "create and apply migration"
npx prisma migrate dev

echo "generate schema"
npx prisma generate

echo "try importing generated schema"
node prisma/client.js

echo "create superuser"
node prisma/createsu.js catis160 cats@mail.utoronto.ca Catsarec00!

# echo "seed db"
# node prisma/seed.js 