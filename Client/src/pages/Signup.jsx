import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!formData.name.trim()) {
      setMessage({ text: "Please enter your name.", type: "error" });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({
        text: "Passwords do not match. Please verify both fields.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          text: data.message || "Registration failed. Please try again.",
          type: "error",
        });
        return;
      }

      // Automatically log the user in
      login(data.user, data.token);

      setMessage({
        text: "Account created successfully! Preparing your workspace...",
        type: "success",
      });

      setTimeout(() => {
        navigate("/workspace");
      }, 900);
    } catch (error) {
      console.error("Signup network error:", error);
      setMessage({
        text: "Unable to connect to the authentication server.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="logo-group auth-logo-center">
            <div className="logo-badge">⚡</div>
            <div>
              <h1 className="logo-title">CodeHive</h1>
              <p className="logo-subtitle">Real-Time Collaborative Code Editor</p>
            </div>
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-description">
            Join CodeHive to create rooms, collaborate, and edit code in real-time
          </p>
        </div>

        {/* Feedback message banner */}
        {message.text && (
          <div className={`auth-alert auth-alert-${message.type}`}>
            <span className="auth-alert-icon">
              {message.type === "error" ? "⚠️" : "✅"}
            </span>
            <span className="auth-alert-text">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="signup-name">Full Name</label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                id="signup-name"
                type="text"
                name="name"
                className="auth-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ada Lovelace"
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label" htmlFor="signup-email">Email Address</label>
            <div className="input-with-icon">
              <span className="input-icon">✉️</span>
              <input
                id="signup-email"
                type="email"
                name="email"
                className="auth-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="ada@codehive.io"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="signup-password">Password</label>
              <span className="auth-hint">Min 6 characters</span>
            </div>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                name="password"
                className="auth-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Choose a strong password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label" htmlFor="signup-confirm-password">Confirm Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🛡️</span>
              <input
                id="signup-confirm-password"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                className="auth-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-type your password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-inline">Creating account...</span>
            ) : (
              "Sign Up to CodeHive"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch-text">
            Already have an account?{" "}
            <Link to="/login" className="auth-accent-link">
              Sign In
            </Link>
          </p>
          <Link to="/workspace" className="auth-back-link">
            ← Continue as Guest to Editor
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;