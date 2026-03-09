const express = require("express");
const router = express.Router();

const { summarizeText } = require("../controllers/llm.controller");

const llmLimiter = require("../middleware/llmRateLimit");

router.post(
    "/summarize",
    llmLimiter,
    summarizeText
);

module.exports = router;