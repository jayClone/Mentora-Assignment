const requiredEnv = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "GEMINI_API_KEY"
];

requiredEnv.forEach((envVar) => {

    if (!process.env[envVar]) {
        throw new Error(`Missing environment variable: ${envVar}`);
    }

});