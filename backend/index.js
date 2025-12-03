#!/usr/bin/env node
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const Port = () => {
    const args = process.argv;

    if (args.length !== 3) {
        console.error("usage: node index.js port");
        process.exit(1);
    }

    const num = parseInt(args[2], 10);
    if (isNaN(num)) {
        console.error("error: argument must be an integer.");
        process.exit(1);
    }

    return num;
};

import express from "express";
import { expressjwt as jwt } from "express-jwt";
import cors from "cors";
const app = express();

// CORS configuration - allow frontend to access backend
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());

// Serve avatars statically
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

// JWT middleware - decodes token and attaches to req.auth
app.use(
    jwt({
        secret: process.env.JWT_SECRET || "test-secret-key",
        algorithms: ["HS256"],
        credentialsRequired: false,
    })
);

import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events/index.js";
import promotionRoutes from "./routes/promotions.js";
import transactionRoutes from "./routes/transactions.js";
import userRoutes from "./routes/users.js";

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/promotions", promotionRoutes);
app.use("/transactions", transactionRoutes);
app.use("/users", userRoutes);

app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ error: "Unauthorized: invalid or missing token" });
    }
    return next(err);
});

// Start server when run directly (ES module equivalent of require.main === module)
const port = Port();
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on("error", (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});

export default app;