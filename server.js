const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// 🔥 IMPORTANT LINE
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/taskmanager")
.then(() => console.log("DB connected"))
.catch(err => console.log(err));

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("🔥 Backend is alive!");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed protected route 🎉",
    user: req.user
  });
});
const projectRoutes = require("./routes/project");
app.use("/api/projects", projectRoutes);
const taskRoutes = require("./routes/task");
app.use("/api/tasks", taskRoutes);