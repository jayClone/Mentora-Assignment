const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Lesson = require("../src/models/Lesson");
const mongoose = require("mongoose");

jest.setTimeout(30000);
describe("Lesson Endpoints", () => {
  
  let mentorToken;
  let parentToken;
  let mentorUser;
  let lessonId;

  beforeEach(async () => {
    await User.deleteMany({});
    await Lesson.deleteMany({});

    const mentorRes = await request(app)
      .post("/auth/signup")
      .send({
        name: "Mentor User",
        email: "mentor@test.com",
        password: "password123",
        role: "mentor"
      });
    mentorToken = mentorRes.body.token;
    mentorUser = mentorRes.body.user;

    const parentRes = await request(app)
      .post("/auth/signup")
      .send({
        name: "Parent User",
        email: "parent@test.com",
        password: "password123",
        role: "parent"
      });
    parentToken = parentRes.body.token;
  });

  describe("POST /lessons", () => {
    
    it("Should create lesson as mentor", async () => {
      const res = await request(app)
        .post("/lessons")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          title: "Math Basics",
          description: "Learn fundamental math concepts"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.lesson.title).toBe("Math Basics");
      expect(res.body.lesson.mentorId).toBe(mentorUser.id);
    });

    it("Should fail if parent tries to create lesson", async () => {
      const res = await request(app)
        .post("/lessons")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          title: "Lesson Title",
          description: "Description"
        });

      expect(res.statusCode).toBe(403);
    });

    it("Should require title and description", async () => {
      const res = await request(app)
        .post("/lessons")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          title: "Only Title"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("required");
    });
  });

  describe("GET /lessons", () => {
    
    beforeEach(async () => {
      const res = await request(app)
        .post("/lessons")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          title: "Math Lesson",
          description: "Math concepts"
        });
      lessonId = res.body.lesson._id;
    });

    it("Should get all lessons (public)", async () => {
      const res = await request(app)
        .get("/lessons");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.lessons)).toBe(true);
      expect(res.body.lessons.length).toBeGreaterThan(0);
    });

    it("Should not require authentication for listing lessons", async () => {
      const res = await request(app)
        .get("/lessons");

      expect(res.statusCode).toBe(200);
    });
  });

  describe("GET /lessons/:id", () => {
    
    beforeEach(async () => {
      const res = await request(app)
        .post("/lessons")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          title: "Math Lesson",
          description: "Math concepts"
        });
      lessonId = res.body.lesson._id;
    });

    it("Should get lesson by id (public)", async () => {
      const res = await request(app)
        .get(`/lessons/${lessonId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.lesson._id).toBe(lessonId);
    });

    it("Should return 404 for non-existent lesson", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/lessons/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /lessons/:id", () => {
    
    beforeEach(async () => {
      const res = await request(app)
        .post("/lessons")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          title: "Math Lesson",
          description: "Math concepts"
        });
      lessonId = res.body.lesson._id;
    });

    it("Should update lesson as owner mentor", async () => {
      const res = await request(app)
        .put(`/lessons/${lessonId}`)
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          title: "Advanced Math",
          description: "Advanced math concepts"
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.lesson.title).toBe("Advanced Math");
    });

    it("Should fail if other mentor tries to update", async () => {
      const otherMentorRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Mentor",
          email: "other@test.com",
          password: "password123",
          role: "mentor"
        });

      const res = await request(app)
        .put(`/lessons/${lessonId}`)
        .set("Authorization", `Bearer ${otherMentorRes.body.token}`)
        .send({
          title: "Hacked Title"
        });

      expect(res.statusCode).toBe(403);
    });

    it("Should fail if parent tries to update", async () => {
      const res = await request(app)
        .put(`/lessons/${lessonId}`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          title: "Hacked Title"
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe("DELETE /lessons/:id", () => {
    
    beforeEach(async () => {
      const res = await request(app)
        .post("/lessons")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          title: "Math Lesson",
          description: "Math concepts"
        });
      lessonId = res.body.lesson._id;
    });

    it("Should delete lesson as owner mentor", async () => {
      const res = await request(app)
        .delete(`/lessons/${lessonId}`)
        .set("Authorization", `Bearer ${mentorToken}`);

      expect(res.statusCode).toBe(200);
      
      const checkRes = await request(app)
        .get(`/lessons/${lessonId}`);
      
      expect(checkRes.statusCode).toBe(404);
    });

    it("Should fail if other mentor tries to delete", async () => {
      const otherMentorRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Mentor",
          email: "other@test.com",
          password: "password123",
          role: "mentor"
        });

      const res = await request(app)
        .delete(`/lessons/${lessonId}`)
        .set("Authorization", `Bearer ${otherMentorRes.body.token}`);

      expect(res.statusCode).toBe(403);
    });
  });
});