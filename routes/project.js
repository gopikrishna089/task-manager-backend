const express = require("express");
const router = express.Router();

const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// ✅ Create Project (Admin only)
router.post("/", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const { name, description, members } = req.body;

  try {
    const project = new Project({
      name,
      description,
      members: members || [],
      createdBy: req.user.id
    });

    await project.save();

    res.json({ message: "Project created", project });
  } catch (error) {
    res.status(500).json({ message: "Error creating project" });
  }
});


// ✅ Get Projects (member + creator)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { members: req.user.id },
        { createdBy: req.user.id }
      ]
    }).populate("members", "name email");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects" });
  }
});


// ✅ Add Member to Project
router.post("/:id/add-member", authMiddleware, async (req, res) => {
  const { userId } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // only admin or creator can add members
    if (
      req.user.role !== "admin" &&
      project.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // avoid duplicates
    if (!project.members.includes(userId)) {
      project.members.push(userId);
    }

    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error adding member" });
  }
});


module.exports = router;