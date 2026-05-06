const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ IMPORT ROUTES
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/project");
const taskRoutes = require("./routes/task");

// ✅ USE ROUTES
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("API running");
});

// ✅ DB CONNECT
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ✅ PORT (IMPORTANT for Railway)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});