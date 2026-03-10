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

    const lessonRes = await request(app)
      .post("/lessons")
      .set("Authorization", `Bearer ${mentorToken}`)
      .send({
        title: "Math Lesson",
        description: "Math concepts"
      });
    lessonId = lessonRes.body.lesson._id;

    const studentRes = await request(app)
      .post("/students")
      .set("Authorization", `Bearer ${parentToken}`)
      .send({ name: "Test Student", age: 12 });
    studentId = studentRes.body.student._id;
  });

  describe("POST /sessions", () => {
    
    it("Should create session as mentor", async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();
      
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
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();
      
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
    });

    it("Should fail if parent tries to create session", async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();
      
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

      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();

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

    it("Should reject invalid date format", async () => {
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId,
          date: "invalid-date",
          topic: "Topic"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid date format");
    });

    it("Should reject past session dates", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const sessionDate = pastDate.toISOString();

      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: "Topic"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("cannot be in the past");
    });

    it("Should reject topic less than 3 characters", async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();

      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: "ab"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Topic must be 3-200 characters");
    });

    it("Should reject topic greater than 200 characters", async () => {
      const longTopic = "A".repeat(201);
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();

      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: longTopic
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Topic must be 3-200 characters");
    });

    it("Should reject invalid lessonId format", async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();

      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId: "invalid-id",
          date: sessionDate,
          topic: "Topic"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid lesson ID format");
    });
  });

  describe("GET /sessions/lesson/:lessonId", () => {
    
    beforeEach(async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();
      
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
      expect(res.body.sessions.length).toBeGreaterThan(0);
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
          email: "othermentor@test.com",
          password: "password123",
          role: "mentor"
        });

      const otherLessonRes = await request(app)
        .post("/lessons")
        .set("Authorization", `Bearer ${otherMentorRes.body.token}`)
        .send({
          title: "Other Lesson",
          description: "Other lesson description"
        });

      const res = await request(app)
        .get(`/sessions/lesson/${otherLessonRes.body.lesson._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.sessions).toHaveLength(0);
    });

    it("Should reject invalid lessonId format", async () => {
      const res = await request(app)
        .get(`/sessions/lesson/invalid-id`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid lesson ID format");
    });
  });

  describe("GET /sessions/:id", () => {
    
    beforeEach(async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();
      
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
      expect(res.body.message).toContain("Session not found");
    });

    it("Should reject invalid session ID format", async () => {
      const res = await request(app)
        .get(`/sessions/invalid-id`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid session ID format");
    });
  });

  describe("PUT /sessions/:id", () => {
    
    beforeEach(async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();
      
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
          summary: "Updated summary text"
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.session.topic).toBe("Updated Topic");
    });

    it("Should reject topic with invalid length on update", async () => {
      const res = await request(app)
        .put(`/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          topic: "ab"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Topic must be 3-200 characters");
    });

    it("Should reject summary greater than 2000 characters", async () => {
      const longSummary = "A".repeat(2001);
      const res = await request(app)
        .put(`/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          summary: longSummary
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Summary cannot exceed 2000 characters");
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

    it("Should reject invalid session ID format", async () => {
      const res = await request(app)
        .put(`/sessions/invalid-id`)
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          topic: "Updated"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid session ID format");
    });
  });

  describe("DELETE /sessions/:id", () => {
    
    beforeEach(async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();
      
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

    it("Should reject invalid session ID format", async () => {
      const res = await request(app)
        .delete(`/sessions/invalid-id`)
        .set("Authorization", `Bearer ${mentorToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid session ID format");
    });
  });

  describe("GET /sessions", () => {

    beforeEach(async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();
      
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

    it("Should require authentication", async () => {
      const res = await request(app)
        .get("/sessions");

      expect(res.statusCode).toBe(401);
    });

    it("Should return sessions for parent's booked lessons", async () => {
      await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId,
          lessonId
        });

      const res = await request(app)
        .get("/sessions")
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.sessions)).toBe(true);
      expect(res.body.sessions.length).toBeGreaterThan(0);
    });

    it("Should return empty array if parent has no bookings", async () => {
      const res = await request(app)
        .get("/sessions")
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.sessions).toHaveLength(0);
    });

    it("Should not return sessions for lessons not booked by parent", async () => {
      const otherMentorRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Mentor",
          email: "othermentor@test.com",
          password: "password123",
          role: "mentor"
        });

      const otherLessonRes = await request(app)
        .post("/lessons")
        .set("Authorization", `Bearer ${otherMentorRes.body.token}`)
        .send({
          title: "Other Lesson",
          description: "Other lesson description"
        });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const sessionDate = futureDate.toISOString();

      await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${otherMentorRes.body.token}`)
        .send({
          lessonId: otherLessonRes.body.lesson._id,
          date: sessionDate,
          topic: "Other Session"
        });

      const res = await request(app)
        .get("/sessions")
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.sessions).toHaveLength(0);
    });
  });

  describe("GET /sessions/mentor/my-sessions", () => {

    beforeEach(async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();
      
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

    it("Should get mentor's own sessions", async () => {
      const res = await request(app)
        .get("/sessions/mentor/my-sessions")
        .set("Authorization", `Bearer ${mentorToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.sessions)).toBe(true);
      expect(res.body.sessions.length).toBeGreaterThan(0);
    });

    it("Should not return other mentor's sessions", async () => {
      const otherMentorRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Mentor",
          email: "othermentor@test.com",
          password: "password123",
          role: "mentor"
        });

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
      const res = await request(app)
        .get("/sessions/mentor/my-sessions");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /sessions/:id/join", () => {

    beforeEach(async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();
      
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: "Session Topic"
        });
      sessionId = res.body.session._id;

      await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId,
          lessonId
        });
    });

    it("Should join a session successfully", async () => {
      const res = await request(app)
        .post(`/sessions/${sessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.session.attendees).toContain(studentId);
    });

    it("Should fail if student is already attending", async () => {
      await request(app)
        .post(`/sessions/${sessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId
        });

      const res = await request(app)
        .post(`/sessions/${sessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId
        });

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
      const fakeSessionId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/sessions/${fakeSessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("Session not found");
    });

    it("Should require authentication", async () => {
      const res = await request(app)
        .post(`/sessions/${sessionId}/join`)
        .send({
          studentId
        });

      expect(res.statusCode).toBe(401);
    });

    it("Should reject invalid session ID format", async () => {
      const res = await request(app)
        .post(`/sessions/invalid-id/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid session ID format");
    });

    it("Should reject invalid student ID format", async () => {
      const res = await request(app)
        .post(`/sessions/${sessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId: "invalid-id"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid student ID format");
    });

    it("Should fail if student not booked for lesson", async () => {
      const otherStudentRes = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          name: "Other Student",
          age: 11
        });
      const otherStudentId = otherStudentRes.body.student._id;

      const res = await request(app)
        .post(`/sessions/${sessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId: otherStudentId
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("not booked");
    });
  });

  describe("POST /sessions/:id/leave", () => {

    beforeEach(async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours ahead
      const sessionDate = futureDate.toISOString();
      
      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          lessonId,
          date: sessionDate,
          topic: "Session Topic"
        });
      sessionId = res.body.session._id;

      await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId,
          lessonId
        });

      await request(app)
        .post(`/sessions/${sessionId}/join`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId
        });
    });

    it("Should leave a session successfully", async () => {
      const res = await request(app)
        .post(`/sessions/${sessionId}/leave`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.session.attendees).not.toContain(studentId);
    });

    it("Should fail if student is not attending", async () => {
      const otherStudentRes = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          name: "Other Student",
          age: 11
        });
      const otherStudentId = otherStudentRes.body.student._id;

      const res = await request(app)
        .post(`/sessions/${sessionId}/leave`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId: otherStudentId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("not attending");
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
      const fakeSessionId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/sessions/${fakeSessionId}/leave`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("Session not found");
    });

    it("Should require authentication", async () => {
      const res = await request(app)
        .post(`/sessions/${sessionId}/leave`)
        .send({
          studentId
        });

      expect(res.statusCode).toBe(401);
    });

    it("Should reject invalid session ID format", async () => {
      const res = await request(app)
        .post(`/sessions/invalid-id/leave`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid session ID format");
    });

    it("Should reject invalid student ID format", async () => {
      const res = await request(app)
        .post(`/sessions/${sessionId}/leave`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId: "invalid-id"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid student ID format");
    });
  });
});