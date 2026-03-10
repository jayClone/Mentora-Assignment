const { generateWithFallback } = require("../utils/llmClient");

exports.summarizeText = async (req, res) => {

    try {

        const { text } = req.body;

        const trimmedText = text?.trim();
        if (!trimmedText) {
            return res.status(400).json({ message: "Text is required" });
        }
        if (trimmedText.length < 50) {
            return res.status(400).json({
                message: "Text must be at least 50 characters (excluding whitespace)"
            });
        }
        if (trimmedText.length > 10000) {
            return res.status(413).json({ message: "Text too large (max 10,000 characters)" });
        }

        const prompt = `
Summarize the following text into 3-6 concise bullet points.

Text:
${trimmedText}
`;

        const { text: summary, modelUsed } = await generateWithFallback(prompt);

        res.json({
            summary,
            model: modelUsed
        });

    } catch (error) {

        const status = error?.status ?? error?.response?.status;
        if (status === 429) {
            return res.status(429).json({
                message: "All AI models are currently rate-limited. Please try again later."
            });
        }

        res.status(502).json({
            message: "LLM service failed"
        });

    }

};