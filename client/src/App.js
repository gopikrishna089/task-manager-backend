import React, { useState } from "react";
import axios from "axios";

const API = "https://task-manager-backend-production-3ff1.up.railway.app/api";

function App() {
  const [token, setToken] = useState("");
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔐 Login
  const login = async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email,
      password
    });

    setToken(res.data.token);
    alert("Login success");
  };

  // 📋 Get Tasks
  const getTasks = async () => {
    const res = await axios.get(`${API}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setTasks(res.data);
  };

  // 📊 Dashboard
  const getDashboard = async () => {
    const res = await axios.get(`${API}/tasks/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setDashboard(res.data);
  };

  // 🔄 Update Status
  const updateStatus = async (id) => {
    await axios.patch(
      `${API}/tasks/${id}`,
      { status: "completed" },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    getTasks();
    getDashboard();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Team Task Manager</h2>

      {/* 🔐 Login */}
      <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>

      <hr />

      {/* Buttons */}
      <button onClick={getTasks}>Get Tasks</button>
      <button onClick={getDashboard}>Dashboard</button>

      {/* 📊 Dashboard */}
      {dashboard && (
        <div>
          <h3>Dashboard</h3>
          <p>Total: {dashboard.total}</p>
          <p>Pending: {dashboard.pending}</p>
          <p>Completed: {dashboard.completed}</p>
          <p>Overdue: {dashboard.overdue}</p>
        </div>
      )}

      {/* 📋 Tasks */}
      <h3>Tasks</h3>
      {tasks.map((t) => (
        <div key={t._id} style={{ border: "1px solid", margin: 10, padding: 10 }}>
          <p><b>{t.title}</b></p>
          <p>Status: {t.status}</p>
          <button onClick={() => updateStatus(t._id)}>Mark Completed</button>
        </div>
      ))}
    </div>
  );
}

export default App;