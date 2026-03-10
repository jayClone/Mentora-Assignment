const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Student = require("../src/models/Student");
const Lesson = require("../src/models/Lesson");
const Booking = require("../src/models/Booking");
const mongoose = require("mongoose");

jest.setTimeout(30000);
describe("Booking Endpoints", () => {
  
  let parentToken;
  let mentorToken;
  let studentId;
  let lessonId;
  let bookingId;

  beforeEach(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Lesson.deleteMany({});
    await Booking.deleteMany({});

    const parentRes = await request(app)
      .post("/auth/signup")
      .send({
        name: "Parent User",
        email: "parent@test.com",
        password: "password123",
        role: "parent"
      });
    parentToken = parentRes.body.token;

    const mentorRes = await request(app)
      .post("/auth/signup")
      .send({
        name: "Mentor User",
        email: "mentor@test.com",
        password: "password123",
        role: "mentor"
      });
    mentorToken = mentorRes.body.token;

    const studentRes = await request(app)
      .post("/students")
      .set("Authorization", `Bearer ${parentToken}`)
      .send({
        name: "Test Student",
        age: 12
      });
    studentId = studentRes.body.student._id;

    const lessonRes = await request(app)
      .post("/lessons")
      .set("Authorization", `Bearer ${mentorToken}`)
      .send({
        title: "Math Lesson",
        description: "Math concepts"
      });
    lessonId = lessonRes.body.lesson._id;
  });

  describe("POST /bookings", () => {
    
    it("Should create booking as parent", async () => {
      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId,
          lessonId
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.booking.studentId).toBe(studentId);
      expect(res.body.booking.lessonId).toBe(lessonId);
    });

    it("Should fail if mentor tries to create booking", async () => {
      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          studentId,
          lessonId
        });

      expect(res.statusCode).toBe(403);
    });

    it("Should fail if parent tries to book lesson for non-existent student", async () => {
      const fakeStudentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId: fakeStudentId,
          lessonId
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("Student not found");
    });

    it("Should fail if parent tries to book non-existent lesson", async () => {
      const fakeLessonId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId,
          lessonId: fakeLessonId
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("Lesson not found");
    });

    it("Should fail if parent tries to book lesson for other parent's student", async () => {
      const otherParentRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Parent",
          email: "other@test.com",
          password: "password123",
          role: "parent"
        });

      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${otherParentRes.body.token}`)
        .send({
          studentId,
          lessonId
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("own students");
    });

    it("Should not allow duplicate booking for same student and lesson", async () => {
      await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId, lessonId });

      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId, lessonId });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toContain("already booked");
    });

    it("Should reject invalid studentId format", async () => {
      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId: "invalid-id",
          lessonId
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid studentId or lessonId format");
    });

    it("Should reject invalid lessonId format", async () => {
      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId,
          lessonId: "invalid-id"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid studentId or lessonId format");
    });
  });

  describe("GET /bookings", () => {
    
    beforeEach(async () => {
      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId,
          lessonId
        });
      bookingId = res.body.booking._id;
    });

    it("Should get parent's bookings", async () => {
      const res = await request(app)
        .get("/bookings")
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.bookings)).toBe(true);
      expect(res.body.bookings.length).toBe(1);
    });

    it("Should get mentor's bookings for their lessons", async () => {
      const res = await request(app)
        .get("/bookings")
        .set("Authorization", `Bearer ${mentorToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.bookings)).toBe(true);
    });

    it("Should fail without authentication", async () => {
      const res = await request(app)
        .get("/bookings");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /bookings/:id", () => {
    
    beforeEach(async () => {
      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId,
          lessonId
        });
      bookingId = res.body.booking._id;
    });

    it("Should get booking by id as parent", async () => {
      const res = await request(app)
        .get(`/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.booking._id).toBe(bookingId);
    });

    it("Should get booking by id as lesson mentor", async () => {
      const res = await request(app)
        .get(`/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${mentorToken}`);

      expect(res.statusCode).toBe(200);
    });

    it("Should fail for other parent", async () => {
      const otherParentRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Parent",
          email: "other@test.com",
          password: "password123",
          role: "parent"
        });

      const res = await request(app)
        .get(`/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${otherParentRes.body.token}`);

      expect(res.statusCode).toBe(403);
    });

    it("Should reject invalid booking ID format", async () => {
      const res = await request(app)
        .get(`/bookings/invalid-id`)
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid booking ID format");
    });
  });

  describe("DELETE /bookings/:id", () => {
    
    beforeEach(async () => {
      const res = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          studentId,
          lessonId
        });
      bookingId = res.body.booking._id;
    });

    it("Should delete booking as parent", async () => {
      const res = await request(app)
        .delete(`/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      
      const checkRes = await request(app)
        .get(`/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${parentToken}`);
      
      expect(checkRes.statusCode).toBe(404);
    });

    it("Should fail if other parent tries to delete", async () => {
      const otherParentRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Parent",
          email: "other@test.com",
          password: "password123",
          role: "parent"
        });

      const res = await request(app)
        .delete(`/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${otherParentRes.body.token}`);

      expect(res.statusCode).toBe(403);
    });

    it("Should reject invalid booking ID format", async () => {
      const res = await request(app)
        .delete(`/bookings/invalid-id`)
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid booking ID format");
    });
  });
});