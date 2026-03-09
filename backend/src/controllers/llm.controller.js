const model = require("../utils/llmClient");

exports.summarizeText = async (req, res) => {

    try {

        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                message: "Text is required"
            });
        }

        if (text.length < 50) {
            return res.status(400).json({
                message: "Text must be at least 50 characters"
            });
        }

        if (text.length > 10000) {
            return res.status(413).json({
                message: "Text too large"
            });
        }

        const prompt = `
Summarize the following text into 3-6 concise bullet points.

Text:
${text}
`;

        const result = await model.generateContent(prompt);

        const response = await result.response;

        const summary = response.text();

        res.json({
            summary,
            model: "gemini-2.5-flash"
        });

    } catch (error) {

        res.status(502).json({
            message: "LLM service failed"
        });

    }

};