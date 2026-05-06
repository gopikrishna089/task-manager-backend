import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate
} from "react-router-dom";
import axios from "axios";

const API = "https://task-manager-backend-production-3ff1.up.railway.app/api";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

//////////////////// ROUTE PROTECTION ////////////////////

function ProtectedRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
}

function GuestRoute({ children }) {
  return !localStorage.getItem("token") ? children : <Navigate to="/dashboard" />;
}

//////////////////// NAVBAR ////////////////////

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={styles.nav}>
      <h2>⚡ Task Manager</h2>

      <div>
        {!isLoggedIn ? (
          <>
            <Link to="/"><button style={styles.navBtn}>Home</button></Link>
            <Link to="/login"><button style={styles.navBtn}>Login</button></Link>
            <Link to="/signup"><button style={styles.navBtn}>Signup</button></Link>
          </>
        ) : (
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

//////////////////// HOME ////////////////////

function Home() {
  return (
    <div style={styles.hero}>
      <h1>🚀 Smart Task Manager</h1>
      <p>Manage your team tasks efficiently and track progress.</p>
      <Link to="/login">
        <button style={styles.primaryBtn}>Get Started</button>
      </Link>
    </div>
  );
}

//////////////////// LOGIN ////////////////////

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("user@test.com");
  const [password, setPassword] = useState("123456");

  const login = async () => {
    const res = await axios.post(`${API}/auth/login`, { email, password });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("name", res.data.user.name);

    navigate("/dashboard");
  };

  return (
    <div style={styles.authBg}>
      <div style={styles.authCard}>
        <h2>Welcome Back 👋</h2>
        <input style={styles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button style={styles.primaryBtn} onClick={login}>Login</button>
      </div>
    </div>
  );
}

//////////////////// SIGNUP ////////////////////

function Signup() {
  const navigate = useNavigate();

  const signup = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    await axios.post(`${API}/auth/signup`, {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password")
    });

    alert("Signup successful");
    navigate("/login");
  };

  return (
    <div style={styles.authBg}>
      <form style={styles.authCard} onSubmit={signup}>
        <h2>Create Account ✨</h2>
        <input name="name" style={styles.input} placeholder="Name" />
        <input name="email" style={styles.input} placeholder="Email" />
        <input name="password" type="password" style={styles.input} placeholder="Password" />
        <button style={styles.primaryBtn}>Signup</button>
      </form>
    </div>
  );
}

//////////////////// DASHBOARD ////////////////////

function Dashboard() {
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");

  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [view, setView] = useState("dashboard");

  const fetchData = async () => {
    const [tasksRes, dashRes] = await Promise.all([
      axios.get(`${API}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API}/tasks/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    setTasks(tasksRes.data);
    setDashboard(dashRes.data);
  };

  // ✅ FIXED HERE
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Better to keep outside, but this still works
  function Stat({ label, value }) {
    return (
      <div style={styles.statCard}>
        <h2>{value}</h2>
        <p>{label}</p>
      </div>
    );
  }

  return (
    <div style={styles.dashContainer}>
      <h1>Welcome, {name} 👋</h1>

      <div style={{ marginBottom: "20px" }}>
        <button style={styles.primaryBtn} onClick={() => setView("dashboard")}>
          📊 Dashboard
        </button>

        <button style={styles.secondaryBtn} onClick={() => setView("tasks")}>
          📋 Tasks
        </button>
      </div>

      {view === "dashboard" && dashboard && (
        <div style={styles.statsGrid}>
          <Stat label="Total" value={dashboard.total} />
          <Stat label="Pending" value={dashboard.pending} />
          <Stat label="Completed" value={dashboard.completed} />
          <Stat label="Overdue" value={dashboard.overdue} />
        </div>
      )}

      {view === "tasks" && (
        <div style={styles.taskGrid}>
          {tasks.map((t) => (
            <div key={t._id} style={styles.taskCard}>
              <h3>{t.title}</h3>
              <p>{t.description}</p>
              <span style={statusStyle(t.status)}>{t.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const statusStyle = (status) => ({
  padding: "5px 10px",
  borderRadius: "20px",
  background:
    status === "completed"
      ? "#22c55e"
      : status === "in-progress"
      ? "#f59e0b"
      : "#ef4444",
  color: "#fff"
});

//////////////////// STYLES ////////////////////

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 30px",
    background: "#111827",
    color: "#fff"
  },
  navBtn: {
    margin: "5px",
    padding: "8px 15px",
    background: "#374151",
    color: "#fff",
    border: "none",
    borderRadius: "5px"
  },
  logoutBtn: {
    margin: "5px",
    padding: "8px 15px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "5px"
  },
  hero: {
    height: "90vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "#fff"
  },
  authBg: {
    height: "90vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#1e3c72,#2a5298)"
  },
  authCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "15px",
    width: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  primaryBtn: {
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px"
  },
  dashContainer: {
    maxWidth: "1100px",
    margin: "auto",
    padding: "40px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "20px",
    marginBottom: "30px"
  },
  statCard: {
  background: "#fff",
  padding: "25px",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
},
  taskGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "20px"
  },
  taskCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
  }
};