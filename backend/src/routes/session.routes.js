const express = require("express");
const router = express.Router();
const {
    createSession,
    getSessionsByLesson,
    getSessionById,
    updateSession,
    deleteSession
} = require("../controllers/session.controller");
const requireAuth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

router.get("/lesson/:lessonId", getSessionsByLesson);
router.get("/:id", getSessionById);
router.post("/", requireAuth, requireRole("mentor"), createSession);
router.put("/:id", requireAuth, requireRole("mentor"), updateSession);
router.delete("/:id", requireAuth, requireRole("mentor"), deleteSession);

module.exports = router;