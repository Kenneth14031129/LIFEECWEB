require("dotenv").config();
require('express-async-errors');
const connectDB = require("./db/connect");
const express = require("express");
const cors = require('cors');
const path = require('path');
const app = express();

const mainRouter = require("./routes/user"); 
const patientRouter = require("./routes/patient"); 
const residentRouter = require("./routes/resident");
const dashboardRouter = require("./routes/dashboard");
const healthProgressRouter = require('./routes/healthProgress');
const activitiesRouter = require('./routes/activities');
const mealRouter = require("./routes/meal");
const userRouter = require("./routes/user");
const messageRouter = require("./routes/message");
const authRoute = require("./routes/auth");

const User = require("./models/User");
const bcrypt = require("bcryptjs");

// Enable CORS with updated configuration
app.use(cors({
    origin: ['http://localhost:5173', 'https://lifeec.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1", mainRouter); 
app.use("/api/v1/patient", patientRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/resident", residentRouter);
app.use("/api/v1/health-progress", healthProgressRouter);
app.use("/api/v1/activities", activitiesRouter);
app.use("/api/v1/meal", mealRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/auth", authRoute);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, 'client/dist')));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const port = process.env.PORT || 3000;

// Seeder function
const seedUsers = async () => {
    try {
        // Clear existing users if needed
        await User.deleteMany({});

        // Password hashing
        const salt = await bcrypt.genSalt(10);

        // User data
        const users = [
            {
                name: "Owner User",
                email: "owner@example.com",
                password: await bcrypt.hash("12345", salt),
                userType: "Owner",
            },
            {
                name: "Admin User",
                email: "admin@example.com",
                password: await bcrypt.hash("12345", salt),
                userType: "Admin",
            },
        ];

        // Insert users into the database
        await User.insertMany(users);
        console.log("Users seeded successfully.");
    } catch (error) {
        console.error("Error seeding users:", error);
    }
};

// Main start function
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);

        // Check for SEED environment variable or command-line argument
        const shouldSeed = process.env.SEED === 'true' || process.argv.includes('--seed');

        if (shouldSeed) {
            console.log("Seeding database...");
            await seedUsers();
            console.log("Seeding completed.");
            process.exit(); // Exit after seeding
        } else {
            app.listen(port, '0.0.0.0', () => {
                console.log(`Server is listening on port ${port}`);
                console.log(`Environment: ${process.env.NODE_ENV}`);
            });
        }
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

start();