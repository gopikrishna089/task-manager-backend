const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authMiddleware = require("./middleware/authMiddleware");
require("dotenv").config();

const app = express();

// ✅ SIMPLE + RELIABLE CORS (this is enough)
app.use(cors());

// ✅ IMPORTANT: handle preflight (fixes your exact error)
app.options("*", cors());

// ✅ JSON
app.use(express.json());

// ✅ DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

// ✅ Routes
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/project");
const taskRoutes = require("./routes/task");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ Root
app.get("/", (req, res) => {
  res.send("🔥 Backend is alive!");
});

// ✅ Protected
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed protected route 🎉",
    user: req.user
  });
});

// ✅ PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});