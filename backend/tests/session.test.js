const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Lesson = require("../src/models/Lesson");
const Session = require("../src/models/Session");
const Student = require("../src/models/Student");
const Booking = require("../src/models/Booking");
const mongoose = require("mongoose");

jest.setTimeout(30000);
describe("Session Endpoints", () => {
  
  let mentorToken;
  let parentToken;
  let lessonId;
  let sessionId;
  let studentId;

  beforeEach(async () => {
    await User.deleteMany({});
    await Lesson.deleteMany({});
    await Session.deleteMany({});
    await Student.deleteMany({});
    await Booking.deleteMany({});

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

    // Create student (used by join/leave and booking tests)
    const studentRes = await request(app)
      .post("/students")
      .set("Authorization", `Bearer ${parentToken}`)
      .send({ name: "Test Student", age: 12 });
    studentId = studentRes.body.student._id;
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

  describe("GET /sessions", () => {

    beforeEach(async () => {
      const sessionDate = new Date().toISOString();
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({ lessonId, date: sessionDate, topic: "Booked Session" });
      sessionId = res.body.session._id;
    });

    it("Should require authentication", async () => {
      const res = await request(app).get("/sessions");
      expect(res.statusCode).toBe(401);
    });

    it("Should return sessions for parent's booked lessons", async () => {
      await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId, lessonId });

      const res = await request(app)
        .get("/sessions")
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.sessions)).toBe(true);
      expect(res.body.sessions.length).toBe(1);
      expect(res.body.sessions[0].topic).toBe("Booked Session");
    });

    it("Should return empty array if parent has no bookings", async () => {
      const res = await request(app)
        .get("/sessions")
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.sessions).toHaveLength(0);
    });

    it("Should not return sessions for lessons not booked by parent", async () => {
      // Other parent books the same lesson — original parent should still see 0
      const otherParentRes = await request(app)
        .post("/auth/signup")
        .send({ name: "Other Parent", email: "other@test.com", password: "password123", role: "parent" });

      const otherStudentRes = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${otherParentRes.body.token}`)
        .send({ name: "Other Student", age: 10 });

      await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${otherParentRes.body.token}`)
        .send({ studentId: otherStudentRes.body.student._id, lessonId });

      // Original parent (no booking) should see nothing
      const res = await request(app)
        .get("/sessions")
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.sessions).toHaveLength(0);
    });
  });

  describe("GET /sessions/mentor/my-sessions", () => {

    beforeEach(async () => {
      const sessionDate = new Date().toISOString();
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({ lessonId, date: sessionDate, topic: "Mentor's Session" });
      sessionId = res.body.session._id;
    });

    it("Should get mentor's own sessions", async () => {
      const res = await request(app)
        .get("/sessions/mentor/my-sessions")
        .set("Authorization", `Bearer ${mentorToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.sessions)).toBe(true);
      expect(res.body.sessions.length).toBe(1);
      expect(res.body.sessions[0].topic).toBe("Mentor's Session");
    });

    it("Should not return other mentor's sessions", async () => {
      const otherMentorRes = await request(app)
        .post("/auth/signup")
        .send({ name: "Other Mentor", email: "other@test.com", password: "password123", role: "mentor" });

      const res = await request(app)
        .get("/sessions/mentor/my-sessions")
        .set("Authorization", `Bearer ${otherMentorRes.body.token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.sessions).toHaveLength(0);
    });

    it("Should fail if parent tries to access mentor sessions", async () => {
      const res = await request(app)
        .get("/sessions/mentor/my-sessions")
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("Should require authentication", async () => {
      const res = await request(app).get("/sessions/mentor/my-sessions");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /sessions/:id/join", () => {

    beforeEach(async () => {
      const sessionDate = new Date().toISOString();
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({ lessonId, date: sessionDate, topic: "Attendance Session" });
      sessionId = res.body.session._id;
    });

    it("Should join a session successfully", async () => {
      const res = await request(app)
        .post(`/sessions/${sessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Successfully joined session");
      expect(res.body.session.attendees).toContain(studentId);
    });

    it("Should fail if student is already attending", async () => {
      await request(app)
        .post(`/sessions/${sessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId });

      const res = await request(app)
        .post(`/sessions/${sessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("already attending");
    });

    it("Should fail without studentId", async () => {
      const res = await request(app)
        .post(`/sessions/${sessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("studentId is required");
    });

    it("Should return 404 for non-existent session", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/sessions/${fakeId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId });

      expect(res.statusCode).toBe(404);
    });

    it("Should require authentication", async () => {
      const res = await request(app)
        .post(`/sessions/${sessionId}/join`)
        .send({ studentId });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /sessions/:id/leave", () => {

    beforeEach(async () => {
      const sessionDate = new Date().toISOString();
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({ lessonId, date: sessionDate, topic: "Attendance Session" });
      sessionId = res.body.session._id;

      // Join first so we can test leaving
      await request(app)
        .post(`/sessions/${sessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId });
    });

    it("Should leave a session successfully", async () => {
      const res = await request(app)
        .post(`/sessions/${sessionId}/leave`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Successfully left session");
      expect(res.body.session.attendees).not.toContain(studentId);
    });

    it("Should remove only the specified student from attendees", async () => {
      // Add a second student
      const student2Res = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ name: "Second Student", age: 11 });
      const student2Id = student2Res.body.student._id;

      await request(app)
        .post(`/sessions/${sessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId: student2Id });

      // Leave with first student
      const res = await request(app)
        .post(`/sessions/${sessionId}/leave`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId });

      expect(res.statusCode).toBe(200);
      expect(res.body.session.attendees).toHaveLength(1);
      expect(res.body.session.attendees).toContain(student2Id);
    });

    it("Should fail without studentId", async () => {
      const res = await request(app)
        .post(`/sessions/${sessionId}/leave`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("studentId is required");
    });

    it("Should return 404 for non-existent session", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/sessions/${fakeId}/leave`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId });

      expect(res.statusCode).toBe(404);
    });

    it("Should require authentication", async () => {
      const res = await request(app)
        .post(`/sessions/${sessionId}/leave`)
        .send({ studentId });

      expect(res.statusCode).toBe(401);
    });
  });
});