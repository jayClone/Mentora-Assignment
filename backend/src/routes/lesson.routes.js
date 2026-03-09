const express = require("express");
const router = express.Router();
const {
    createLesson,
    getLessons,
    getMentorLessons,
    getLessonById,
    updateLesson,
    deleteLesson
} = require("../controllers/lesson.controller");
const requireAuth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

router.get("/", getLessons);
router.get("/mentor/my-lessons", requireAuth, requireRole("mentor"), getMentorLessons);
router.get("/:id", getLessonById);
router.post("/", requireAuth, requireRole("mentor"), createLesson);
router.put("/:id", requireAuth, requireRole("mentor"), updateLesson);
router.delete("/:id", requireAuth, requireRole("mentor"), deleteLesson);

module.exports = router;