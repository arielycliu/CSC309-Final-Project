This text file should explain how to deploy your website.
You should write detailed description on:

1. All the packages you need to install
2. How to configure various servers (e.g., Nginx, Apache, etc)

---

## LOCAL INSTALLATION
1. Clone the repo: https://github.com/arielycliu/CSC309-Final-Project.git

### Set up backend:
2. `cd backend` and run `npm i`
3. If setting up a new database: 
   a. Sign into https://console.prisma.io
   b. Create a new project and select Prisma Postgres
   c. Open up the project and click "Connect to your database"
   d. Generate a new connection string
   e. Create a new `.env` file under `/backend`
   f. Add the connection string to the env file: `DATABASE_URL=<connection-string>`
   g. Run `bash start.sh` inside of the backend to seed the database
3. If using our existing database:
   a. Create a new `.env` file under `/backend`
   b. Add this to the env file: `DATABASE_URL="postgres://f21a662169a1a4cf1c0f196f46631b526c125f412a66466b36ab5e2049f0e6ce:sk_kBEftsUXEZ82wznWwEXjE@db.prisma.io:5432/postgres?sslmode=require"`
4. Generate a JWT_SECRET using something like: https://jwtsecrets.com/#generator and add it to the `/backend/.env` file `JWT_SECRET=<some-secret>`
5. Add frontend url to .env file: `FRONTEND_URL="http://localhost:5173"`
5. Run `node --watch index.js 3000` to start the backend server, you can also change the port but all the documentation is based on port 3000

### Set up frontend:
6. `cd backend` and run `npm i`
7. Create a new `.env` file under `/frontend`
8. Add the backend url to the `.env` file: `VITE_API_BASE="http://localhost:3000"`
9. Add our mapbox token to your `.env` file or generate a new one: `VITE_MAPBOX_TOKEN="pk.eyJ1IjoiYWxsb2YwMiIsImEiOiJjbWlqdmJwZDMxNjFzM2twc3JtZ2FseXFwIn0.lBIEqvbWuYKITrzW1qZezA"`
10. Run `npm run dev` to start the frontend server locally


## DEPLOYING ON RAILWAY