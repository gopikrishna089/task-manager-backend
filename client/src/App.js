import React, { useState } from "react";
import axios from "axios";

const API = "https://task-manager-backend-production-3ff1.up.railway.app/api";

function App() {
  const [token, setToken] = useState("");
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  const [email, setEmail] = useState("user@test.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN
  const login = async () => {
    try {
      setLoading(true);

      const res = await axios.post(`${API}/auth/login`, {
        email,
        password
      });

      console.log("NEW TOKEN:", res.data.token);

    setToken(res.data.token);
    localStorage.setItem("token", res.data.token);

    alert("Login success 🚀");
  } catch (e) {
    console.log(e.response?.data);
  }
};

  // 📋 GET TASKS
  const getTasks = async () => {
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const res = await axios.get(`${API}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(res.data);
    } catch (err) {
      console.log("TASK ERROR:", err.response?.data);
    }
  };

  // 📊 DASHBOARD
  const getDashboard = async () => {
  console.log("TOKEN USED:", token); // 👈 add this

  if (!token) {
    alert("Login first");
    return;
  }

  try {
    const res = await axios.get(`${API}/tasks/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setDashboard(res.data);
  } catch (err) {
    console.log("DASH ERROR:", err.response?.data);
  }
};

  // 🔄 UPDATE STATUS
  const updateStatus = async (id) => {
    try {
      await axios.patch(
        `${API}/tasks/${id}`,
        { status: "completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      getTasks();
      getDashboard();
    } catch (err) {
      console.log("UPDATE ERROR:", err.response?.data);
    }
  };

  // 🎨 STATUS COLORS
  const statusColor = (status) => {
    if (status === "completed") return "#00ff9d";
    if (status === "in-progress") return "#ffd166";
    return "#ff6b6b";
  };

  return (
    <div style={styles.bg}>
      <div style={styles.overlay} />

      <div style={styles.container}>
        <h1 style={styles.title}>⚡ Team Task Manager</h1>

        {/* LOGIN */}
        {!token && (
          <div style={styles.loginCard}>
            <h3>Login</h3>
            <input
              style={styles.input}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button style={styles.primaryBtn} onClick={login}>
              {loading ? "Loading..." : "Login"}
            </button>
          </div>
        )}

        {/* MAIN APP */}
        {token && (
          <>
            <div style={styles.buttonRow}>
              <button style={styles.primaryBtn} onClick={getTasks}>
                📋 Tasks
              </button>
              <button style={styles.secondaryBtn} onClick={getDashboard}>
                📊 Dashboard
              </button>
            </div>

            {/* DASHBOARD */}
            {dashboard && (
              <div style={styles.dashboard}>
                <Stat label="Total" value={dashboard.total} />
                <Stat label="Pending" value={dashboard.pending} />
                <Stat label="Completed" value={dashboard.completed} />
                <Stat label="Overdue" value={dashboard.overdue} />
              </div>
            )}

            {/* TASKS */}
            <div style={styles.grid}>
              {tasks.map((t) => (
                <div key={t._id} style={styles.card}>
                  <h3>{t.title}</h3>
                  <p>{t.description}</p>

                  <span
                    style={{
                      ...styles.badge,
                      background: statusColor(t.status)
                    }}
                  >
                    {t.status}
                  </span>

                  <p style={{ fontSize: "12px", opacity: 0.7 }}>
                    Due: {new Date(t.dueDate).toLocaleDateString()}
                  </p>

                  <button
                    style={styles.smallBtn}
                    onClick={() => updateStatus(t._id)}
                  >
                    ✔ Mark Done
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 📊 STAT COMPONENT
const Stat = ({ label, value }) => (
  <div style={styles.stat}>
    <h2>{value}</h2>
    <p>{label}</p>
  </div>
);

// 🎨 STYLES
const styles = {
  bg: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(circle at 20% 20%, rgba(0,255,200,0.15), transparent 40%)"
  },
  container: {
    position: "relative",
    zIndex: 2,
    padding: "30px",
    color: "#fff",
    fontFamily: "Segoe UI"
  },
  title: {
    textAlign: "center",
    marginBottom: "30px"
  },
  loginCard: {
    maxWidth: "320px",
    margin: "auto",
    padding: "25px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "none"
  },
  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "25px"
  },
  primaryBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    background: "#00ffc6",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold"
  },
  secondaryBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    background: "#ffd166",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold"
  },
  dashboard: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "30px"
  },
  stat: {
    background: "rgba(255,255,255,0.1)",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    padding: "20px",
    borderRadius: "15px"
  },
  badge: {
    padding: "5px 10px",
    borderRadius: "20px",
    color: "#000",
    fontWeight: "bold",
    fontSize: "12px"
  },
  smallBtn: {
    marginTop: "10px",
    padding: "8px",
    borderRadius: "6px",
    border: "none",
    background: "#00ff9d",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default App;