import express from "express";

const router = express.Router();

// Quiz routes
router.get("/", (req, res) => {
  res.json({ message: "List of quizzes" });
});

router.post("/", (req, res) => {
  res.json({ message: "Create a new quiz" });
});

export default router;
