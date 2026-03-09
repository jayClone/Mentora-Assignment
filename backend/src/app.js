const express = require("express");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const lessonRoutes = require("./routes/lesson.routes");
const bookingRoutes = require("./routes/booking.routes");
const sessionRoutes = require("./routes/session.routes");
const llmRoutes = require("./routes/llm.routes");
const healthRoutes = require("./routes/health.routes");

const errorHandler = require("./middleware/error.middleware");

const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();


// middleware
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));

// Rate limiting - higher limit for development
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 5000, // 5000 requests for dev, 100 for prod
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);


// routes
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/lessons", lessonRoutes);
app.use("/bookings", bookingRoutes);
app.use("/sessions", sessionRoutes);
app.use("/llm", llmRoutes);


// global error handler
app.use(errorHandler);


module.exports = app;