const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");

jest.setTimeout(30000);
describe("Auth Endpoints", () => {
  
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /auth/signup", () => {
    
    it("Should signup a parent successfully", async () => {
      const res = await request(app)
        .post("/auth/signup")
        .send({
          name: "John Parent",
          email: "parent@example.com",
          password: "password123",
          role: "parent"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.role).toBe("parent");
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("Should signup a mentor successfully", async () => {
      const res = await request(app)
        .post("/auth/signup")
        .send({
          name: "Jane Mentor",
          email: "mentor@example.com",
          password: "password123",
          role: "mentor"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.role).toBe("mentor");
    });

    it("Should reject invalid role", async () => {
      const res = await request(app)
        .post("/auth/signup")
        .send({
          name: "Invalid User",
          email: "invalid@example.com",
          password: "password123",
          role: "admin"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid role");
    });

    it("Should not allow duplicate email", async () => {
      await request(app)
        .post("/auth/signup")
        .send({
          name: "User 1",
          email: "duplicate@example.com",
          password: "password123",
          role: "parent"
        });

      const res = await request(app)
        .post("/auth/signup")
        .send({
          name: "User 2",
          email: "duplicate@example.com",
          password: "password123",
          role: "parent"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("already exists");
    });

    it("Should require all fields", async () => {
      const res = await request(app)
        .post("/auth/signup")
        .send({
          name: "Incomplete User"
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    
    beforeEach(async () => {
      await request(app)
        .post("/auth/signup")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          role: "parent"
        });
    });

    it("Should login successfully with correct credentials", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "password123"
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toBeDefined();
      if (res.body.user) {
        expect(res.body.user.email).toBe("test@example.com");
      }
    });

    it("Should fail with wrong password", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword"
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain("Invalid credentials");
    });

    it("Should fail with non-existent email", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123"
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain("Invalid credentials");
    });
  });

  describe("GET /auth/me", () => {
    
    let authToken;
    
    beforeEach(async () => {
      const res = await request(app)
        .post("/auth/signup")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          role: "parent"
        });
      authToken = res.body.token;
    });

    it("Should get current user with valid token", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe("test@example.com");
      expect(res.body.user.role).toBe("parent");
    });

    it("Should fail without token", async () => {
      const res = await request(app)
        .get("/auth/me");

      expect(res.statusCode).toBe(401);
    });

    it("Should fail with invalid token", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", "Bearer invalid_token");

      expect(res.statusCode).toBe(401);
    });

    it("Should fail with malformed header", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `InvalidToken ${authToken}`);

      expect(res.statusCode).toBe(401);
    });
  });
});