import { useState } from "react";
import InputSearch from "../../Components/InputSearch";
import styles from "./Login.module.scss";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../Components/Button";
import { useUser } from "../../Hook/useUserContext";
import Input from "../../Components/Input";

function SignUpBox({ onSuccess }) {
  const { setUser } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/user/signUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign up failed");
        return;
      }

      setUser(data);
      onSuccess()
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginBox}>
      <h2>Sign Up</h2>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      <div className={styles.fromLogin}>
        <Input
          placeholder="Name"
          icon={false}
          onChange={setName}
          id="signup-name"
        />

        <Input
          placeholder="Email"
          icon={false}
          onChange={setEmail}
          id="signup-email"
        />

        <Input
          placeholder="Password"
          icon={false}
          type="password"
          onChange={setPassword}
          id="signup-password"
        />

        <Button onClick={handleSignUp} disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>
      </div>
    </div>
  );
}

function LogInBox() {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      setUser(data);
      navigate("/");
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginBox}>
      <h2>Login</h2>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      <div className={styles.fromLogin}>
        <InputSearch
          placeholder="Email"
          icon={false}
          onChange={setEmail}
          id="login-password"

        />

        <InputSearch
          placeholder="Password"
          icon={false}
          type="password"
          onChange={setPassword}
          id="login-password"
        />

        <Button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging In..." : "Login"}
        </Button>
      </div>
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState("login");

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <Link to="/">ELORA STORE</Link>
        <span>
          Your one-stop shop for quality products, great prices, and fast
          delivery.
        </span>
      </div>

      <div className={styles.right}>
        {mode === "login" && <LogInBox key="login" />}
        {mode === "signUp" && (
  <SignUpBox onSuccess={() => setMode("login")} />
)}
      </div>

      <div className={styles.mode}>
        {mode === "login" && (
          <Button onClick={() => setMode("signUp")}>
            Sign Up
          </Button>
        )}

        {mode === "signUp" && (
          <Button onClick={() => setMode("login")}>
            Log In
          </Button>
        )}
      </div>
    </div>
  );
}
