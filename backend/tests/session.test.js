const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Lesson = require("../src/models/Lesson");
const Session = require("../src/models/Session");
const mongoose = require("mongoose");

jest.setTimeout(30000);
describe("Session Endpoints", () => {
  
  let mentorToken;
  let parentToken;
  let lessonId;
  let sessionId;

  beforeEach(async () => {
    await User.deleteMany({});
    await Lesson.deleteMany({});
    await Session.deleteMany({});

    const mentorRes = await request(app)
      .post("/auth/signup")
      .send({
        name: "Mentor User",
        email: "mentor@test.com",
        password: "password123",
        role: "mentor"
      });
    mentorToken = mentorRes.body.token;

    const parentRes = await request(app)
      .post("/auth/signup")
      .send({
        name: "Parent User",
        email: "parent@test.com",
        password: "password123",
        role: "parent"
      });
    parentToken = parentRes.body.token;

    // Create lesson
    const lessonRes = await request(app)
      .post("/lessons")
      .set("Authorization", `Bearer ${mentorToken}`)
      .send({
        title: "Math Lesson",
        description: "Math concepts"
      });
    lessonId = lessonRes.body.lesson._id;
  });

  describe("POST /sessions", () => {
    
    it("Should create session as mentor", async () => {
      const sessionDate = new Date().toISOString();
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: "Addition and Subtraction",
          summary: "Covered basic addition and subtraction"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.session.topic).toBe("Addition and Subtraction");
      expect(res.body.session.lessonId).toBe(lessonId);
    });

    it("Should create session without optional summary", async () => {
      const sessionDate = new Date().toISOString();
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: "Multiplication"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.session.topic).toBe("Multiplication");
      expect(res.body.session.summary).toBeUndefined();
    });

    it("Should fail if parent tries to create session", async () => {
      const sessionDate = new Date().toISOString();
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: "Topic"
        });

      expect(res.statusCode).toBe(403);
    });

    it("Should fail if mentor tries to create session for other mentor's lesson", async () => {
      const otherMentorRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Mentor",
          email: "other@test.com",
          password: "password123",
          role: "mentor"
        });

      const sessionDate = new Date().toISOString();
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${otherMentorRes.body.token}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: "Topic"
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("own lessons");
    });

    it("Should require lessonId, date, and topic", async () => {
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /sessions/lesson/:lessonId", () => {
    
    beforeEach(async () => {
      const sessionDate = new Date().toISOString();
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: "Session Topic"
        });
      sessionId = res.body.session._id;
    });

    it("Should get all sessions for a lesson (public)", async () => {
      const res = await request(app)
        .get(`/sessions/lesson/${lessonId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.sessions)).toBe(true);
      expect(res.body.sessions.length).toBe(1);
      expect(res.body.sessions[0].topic).toBe("Session Topic");
    });

    it("Should not require authentication", async () => {
      const res = await request(app)
        .get(`/sessions/lesson/${lessonId}`);

      expect(res.statusCode).toBe(200);
    });

    it("Should return empty array for lesson with no sessions", async () => {
      const otherMentorRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Mentor",
          email: "other@test.com",
          password: "password123",
          role: "mentor"
        });

      const lessonRes = await request(app)
        .post("/lessons")
        .set("Authorization", `Bearer ${otherMentorRes.body.token}`)
        .send({
          title: "Other Lesson",
          description: "Description"
        });

      const res = await request(app)
        .get(`/sessions/lesson/${lessonRes.body.lesson._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.sessions).toHaveLength(0);
    });
  });

  describe("GET /sessions/:id", () => {
    
    beforeEach(async () => {
      const sessionDate = new Date().toISOString();
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: "Session Topic"
        });
      sessionId = res.body.session._id;
    });

    it("Should get session by id (public)", async () => {
      const res = await request(app)
        .get(`/sessions/${sessionId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.session._id).toBe(sessionId);
    });

    it("Should return 404 for non-existent session", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/sessions/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /sessions/:id", () => {
    
    beforeEach(async () => {
      const sessionDate = new Date().toISOString();
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: "Original Topic"
        });
      sessionId = res.body.session._id;
    });

    it("Should update session as owner mentor", async () => {
      const res = await request(app)
        .put(`/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          topic: "Updated Topic",
          summary: "Updated summary"
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.session.topic).toBe("Updated Topic");
      expect(res.body.session.summary).toBe("Updated summary");
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
        .put(`/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${otherMentorRes.body.token}`)
        .send({
          topic: "Hacked Topic"
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe("DELETE /sessions/:id", () => {
    
    beforeEach(async () => {
      const sessionDate = new Date().toISOString();
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: "Session Topic"
        });
      sessionId = res.body.session._id;
    });

    it("Should delete session as owner mentor", async () => {
      const res = await request(app)
        .delete(`/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${mentorToken}`);

      expect(res.statusCode).toBe(200);
      
      const checkRes = await request(app)
        .get(`/sessions/${sessionId}`);
      
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
        .delete(`/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${otherMentorRes.body.token}`);

      expect(res.statusCode).toBe(403);
    });
  });
});