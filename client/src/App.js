import React, { useState } from "react";
import axios from "axios";

function App() {
  const [token, setToken] = useState("");

  const login = async () => {
  try {
    const res = await axios.post(
      "https://task-manager-backend-production-3ff1.up.railway.app/api/auth/login",
      {
        email: "user@test.com",
        password: "123456"
      }
    );

    console.log(res.data);
    setToken(res.data.token);
    alert("Login success");
  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
    alert("Check console (F12)");
  }
};

  return (
    <div style={{ padding: 20 }}>
      <h2>Task Manager</h2>

      <button onClick={login}>Login</button>

      <p>Token: {token}</p>
    </div>
  );
}

export default App;