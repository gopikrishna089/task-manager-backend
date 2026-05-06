const express = require("express");
const router = express.Router();

const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// ✅ Create Task (Admin only)
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


// ✅ Get My Tasks (with populate)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id
    })
      .populate("assignedTo", "name email")
      .populate("projectId", "name");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});


// ✅ Update Task Status (secure + validated)
router.patch("/:id", authMiddleware, async (req, res) => {
  const { status } = req.body;

  const allowed = ["pending", "in-progress", "completed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (
      task.assignedTo.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
});


// ✅ Dashboard API
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await Task.countDocuments({ assignedTo: userId });

    const pending = await Task.countDocuments({
      assignedTo: userId,
      status: "pending"
    });

    const completed = await Task.countDocuments({
      assignedTo: userId,
      status: "completed"
    });

    const overdue = await Task.countDocuments({
      assignedTo: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" }
    });

    res.json({ total, pending, completed, overdue });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard" });
  }
});


module.exports = router;