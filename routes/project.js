const express = require("express");
const router = express.Router();

const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create Project (Admin only)
router.post("/", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const { name, description, members } = req.body;

  try {
    const project = new Project({
      name,
      description,
      members,
      createdBy: req.user.id
    });

    await project.save();

    res.json({ message: "Project created", project });
  } catch (error) {
    res.status(500).json({ message: "Error creating project" });
  }
});

// Get Projects
router.get("/", authMiddleware, async (req, res) => {
  const projects = await Project.find({
    members: req.user.id
  });

  res.json(projects);
});

module.exports = router;