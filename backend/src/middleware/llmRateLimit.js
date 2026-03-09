const rateLimit = require("express-rate-limit");

const llmLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        message: "Too many requests, please try again later"
    }
});

module.exports = llmLimiter;