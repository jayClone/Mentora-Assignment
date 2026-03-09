const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Student = require("../src/models/Student");
const mongoose = require("mongoose");

jest.setTimeout(30000);
describe("Student Endpoints", () => {
  
  let parentToken;
  let mentorToken;
  let parentUser;
  let studentId;

  beforeEach(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});

    // Create parent user
    const parentRes = await request(app)
      .post("/auth/signup")
      .send({
        name: "Parent User",
        email: "parent@test.com",
        password: "password123",
        role: "parent"
      });
    parentToken = parentRes.body.token;
    parentUser = parentRes.body.user;

    // Create mentor user
    const mentorRes = await request(app)
      .post("/auth/signup")
      .send({
        name: "Mentor User",
        email: "mentor@test.com",
        password: "password123",
        role: "mentor"
      });
    mentorToken = mentorRes.body.token;
  });

  describe("POST /students", () => {
    
    it("Should create student as parent", async () => {
      const res = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          name: "John Doe",
          age: 12
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.student.name).toBe("John Doe");
      expect(res.body.student.age).toBe(12);
      expect(res.body.student.parentId).toBe(parentUser.id);
    });

    it("Should fail if mentor tries to create student", async () => {
      const res = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
          name: "Jane Doe",
          age: 10
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Forbidden");
    });

    it("Should fail without authentication", async () => {
      const res = await request(app)
        .post("/students")
        .send({
          name: "Jane Doe",
          age: 10
        });

      expect(res.statusCode).toBe(401);
    });

    it("Should require name and age", async () => {
      const res = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          name: "Incomplete Student"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("required");
    });
  });

  describe("GET /students", () => {
    
    beforeEach(async () => {
      const res = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          name: "Test Student",
          age: 12
        });
      studentId = res.body.student._id;
    });

    it("Should get all parent's students", async () => {
      const res = await request(app)
        .get("/students")
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.students)).toBe(true);
      expect(res.body.students.length).toBe(1);
      expect(res.body.students[0].name).toBe("Test Student");
    });

    it("Should only return logged-in parent's students", async () => {
      // Create another parent
      const otherParentRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Parent",
          email: "other@test.com",
          password: "password123",
          role: "parent"
        });

      // Get first parent's students
      const res = await request(app)
        .get("/students")
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.body.students).toHaveLength(1);
    });

    it("Should fail without authentication", async () => {
      const res = await request(app)
        .get("/students");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /students/:id", () => {
    
    beforeEach(async () => {
      const res = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          name: "Test Student",
          age: 12
        });
      studentId = res.body.student._id;
    });

    it("Should get student by id", async () => {
      const res = await request(app)
        .get(`/students/${studentId}`)
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.student._id).toBe(studentId);
    });

    it("Should fail if accessing other parent's student", async () => {
      const otherParentRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Parent",
          email: "other@test.com",
          password: "password123",
          role: "parent"
        });

      const res = await request(app)
        .get(`/students/${studentId}`)
        .set("Authorization", `Bearer ${otherParentRes.body.token}`);

      expect(res.statusCode).toBe(403);
    });

    it("Should return 404 for non-existent student", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/students/${fakeId}`)
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /students/:id", () => {
    
    beforeEach(async () => {
      const res = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          name: "Test Student",
          age: 12
        });
      studentId = res.body.student._id;
    });

    it("Should update student successfully", async () => {
      const res = await request(app)
        .put(`/students/${studentId}`)
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          name: "Updated Student",
          age: 13
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.student.name).toBe("Updated Student");
      expect(res.body.student.age).toBe(13);
    });

    it("Should fail if parent tries to update another parent's student", async () => {
      const otherParentRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Parent",
          email: "other@test.com",
          password: "password123",
          role: "parent"
        });

      const res = await request(app)
        .put(`/students/${studentId}`)
        .set("Authorization", `Bearer ${otherParentRes.body.token}`)
        .send({
          name: "Hacked Name"
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe("DELETE /students/:id", () => {
    
    beforeEach(async () => {
      const res = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
          name: "Test Student",
          age: 12
        });
      studentId = res.body.student._id;
    });

    it("Should delete student successfully", async () => {
      const res = await request(app)
        .delete(`/students/${studentId}`)
        .set("Authorization", `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      
      const checkRes = await request(app)
        .get(`/students/${studentId}`)
        .set("Authorization", `Bearer ${parentToken}`);
      
      expect(checkRes.statusCode).toBe(404);
    });

    it("Should fail if parent tries to delete another parent's student", async () => {
      const otherParentRes = await request(app)
        .post("/auth/signup")
        .send({
          name: "Other Parent",
          email: "other@test.com",
          password: "password123",
          role: "parent"
        });

      const res = await request(app)
        .delete(`/students/${studentId}`)
        .set("Authorization", `Bearer ${otherParentRes.body.token}`);

      expect(res.statusCode).toBe(403);
    });
  });
});