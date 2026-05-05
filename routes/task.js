const express = require("express");
const router = express.Router();

const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// Create Task (Admin only)
router.post("/", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const { title, description, assignedTo, projectId, dueDate } = req.body;

  try {
    const task = new Task({
      title,
      description,
      assignedTo,
      projectId,
      dueDate
    });

    await task.save();

    res.json({ message: "Task created", task });
  } catch (error) {
    res.status(500).json({ message: "Error creating task" });
  }
});


// Get My Tasks
router.get("/", authMiddleware, async (req, res) => {
  const tasks = await Task.find({
    assignedTo: req.user.id
  });

  res.json(tasks);
});


// Update Task Status
router.patch("/:id", authMiddleware, async (req, res) => {
  const { status } = req.body;

  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
});

module.exports = router;