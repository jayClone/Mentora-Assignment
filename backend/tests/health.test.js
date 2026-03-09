const request = require("supertest");
const app = require("../src/app");

jest.setTimeout(30000);
describe("Health Endpoint", () => {
  
  describe("GET /health", () => {
    
    it("Should return health status", async () => {
      const res = await request(app)
        .get("/health");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Service is healthy");
    });

    it("Should include uptime", async () => {
      const res = await request(app)
        .get("/health");

      expect(res.body).toHaveProperty("uptime");
      expect(typeof res.body.uptime).toBe("number");
      expect(res.body.uptime).toBeGreaterThan(0);
    });

    it("Should include timestamp", async () => {
      const res = await request(app)
        .get("/health");

      expect(res.body).toHaveProperty("timestamp");
      expect(new Date(res.body.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("Should not require authentication", async () => {
      const res = await request(app)
        .get("/health");

      expect(res.statusCode).toBe(200);
    });
  });
});