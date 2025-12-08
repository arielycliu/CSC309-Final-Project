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

TLDR:
Backend env
```
JWT_SECRET=<Your-secret-here>
FRONTEND_URL="http://localhost:5173"
DATABASE_URL="postgres://f21a662169a1a4cf1c0f196f46631b526c125f412a66466b36ab5e2049f0e6ce:sk_kBEftsUXEZ82wznWwEXjE@db.prisma.io:5432/postgres?sslmode=require"
```

Frontend env
```
VITE_API_BASE="http://localhost:3000"
VITE_MAPBOX_TOKEN="pk.eyJ1IjoiYWxsb2YwMiIsImEiOiJjbWlqdmJwZDMxNjFzM2twc3JtZ2FseXFwIn0.lBIEqvbWuYKITrzW1qZezA"
```

Backend packages
```
npm install @prisma/adapter-pg bcrypt cors dotenv express express-jwt jsonwebtoken multer pg sqlite3 uuid zod
```
Frontend packages
```
npm install @radix-ui/react-slot class-variance-authority d3 html5-qrcode lucide-react mapbox-gl qrcode.react react react-dom react-router-dom sonner
```

## DEPLOYING ON RAILWAY
1. Start a new project -> choose empty project

### Set up backend:
2. Add a service, give railway github permission to the repo -> select CSC309-Final-Project
3. Go to settings -> click "Add Root Directory" under "Source Repo"
4. Select `/backend`
5. Click "Generate Domain" under "Networking"
6. Scroll down to the "Build" section, add `npx prisma generate` as the custom build command
7. Set `node index.js 3000` as the "Custom Start Command" under section "Deploy"
8. Configure environmental variables
    a. Go the the variable tab:
    ```
    DATABASE_URL = postgres://f21a662169a1a4cf1c0f196f46631b526c125f412a66466b36ab5e2049f0e6ce:sk_kBEftsUXEZ82wznWwEXjE@db.prisma.io:5432/postgres?sslmode=require
    JWT_SECRET = <Your-secret-here>
    FRONTEND_URL = <blank>
    ```
    b. We will update FRONTEND_URL later
9. Deploy changes

### Set up frontend:
2. Click "Create" in the upper right hand corner -> "Github Repo" -> select "CSC309-Final-Project"
3. Go to settings -> click "Add Root Directory" under "Source Repo"
4. Select `/frontend`
5. Click "Generate Domain" under "Networking"
6. Scroll down to the "Build" section, add `npm run build` as the custom build command
7. Set `npx serve -s dist` as the "Custom Start Command" under section "Deploy"
8. Configure environmental variables
    a. Go the the variable tab:
    ```
    VITE_API_BASE = <Generated-backend-url>
    VITE_MAPBOX_TOKEN = "pk.eyJ1IjoiYWxsb2YwMiIsImEiOiJjbWlqdmJwZDMxNjFzM2twc3JtZ2FseXFwIn0.lBIEqvbWuYKITrzW1qZezA"
    ```
    b. Go to the backend service -> Settings -> Networking -> Public Networking -> and copy the domain for `VITE_API_BASE`
    c. Can also do `${{<railway-backend-name>.RAILWAY_PRIVATE_DOMAIN}}`
9. Deploy changes

### Mount volume for persistent storage (for avatar pictures):
1. Click "Create" -> "Volume" -> "backend"
2. Add volume mount path "/uploads/avatars"
