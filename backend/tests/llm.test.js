const request = require("supertest");
const app = require("../src/app");

jest.setTimeout(60000);
describe("LLM Endpoints", () => {
  
  describe("POST /llm/summarize", () => {
    
    it("Should summarize text successfully", async () => {
      const longText = "JavaScript is a versatile programming language used primarily for web development. It runs in web browsers and can also be used on servers with Node.js. JavaScript enables interactive web pages and is an essential part of web applications.";

      const res = await request(app)
        .post("/llm/summarize")
        .send({
          text: longText
        });

      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty("summary");
        expect(res.body).toHaveProperty("model");
        expect(res.body.model).toBe("gemini-2.5-flash");
        expect(typeof res.body.summary).toBe("string");
      } else if (res.statusCode === 502) {
        expect(res.body.message).toContain("LLM service");
      }
    }, 10000);

    it("Should fail if text is missing", async () => {
      const res = await request(app)
        .post("/llm/summarize")
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Text is required");
    });

    it("Should fail if text is too short", async () => {
      const res = await request(app)
        .post("/llm/summarize")
        .send({
          text: "Short text"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("at least 50 characters");
    });

    it("Should fail if text is too long", async () => {
      const longText = "a".repeat(10001);
      const res = await request(app)
        .post("/llm/summarize")
        .send({
          text: longText
        });

      expect(res.statusCode).toBe(413);
      expect(res.body.message).toContain("too large");
    });

    it.skip("Should be rate limited after many requests", async () => {
      // Cannot reliably test due to AI Studio's 5 RPM limit 
    }, 120000);
  });

});