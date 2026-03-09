const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Models tried in order — falls through to next on rate-limit (429) or overload (503)

const MODEL_FALLBACKS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.0-flash",
    "gemini-3.1-flash-lite",
];

async function generateWithFallback(prompt) {
    let lastError;

    for (const modelName of MODEL_FALLBACKS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return { text, modelUsed: modelName };
        } catch (err) {
            const status = err?.status ?? err?.response?.status;
            if (status === 429 || status === 503) {
                lastError = err;
                continue; // try next model
            }
            throw err; // non-rate-limit error — propagate immediately
        }
    }

    throw lastError || new Error("All LLM models are currently unavailable");
}

module.exports = { generateWithFallback };