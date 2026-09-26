import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

function Login() {
    const { login, logout, user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    // Handle OAuth callback from GitHub
    useEffect(() => {
        const params = new URLSearchParams(
            window.location.hash.substring(1)
        );

        const token = params.get("token");
        const userData = params.get("user");

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);

                login(parsedUser, token);

                setMessage({
                    text: "GitHub login successful!",
                    type: "success",
                });

                window.history.replaceState(
                    {},
                    document.title,
                    "/login"
                );
            } catch (error) {
                console.error(
                    "GitHub login processing error:",
                    error
                );

                setMessage({
                    text: "GitHub login failed.",
                    type: "error",
                });
            }
        }
    }, [login]);

    // Redirect already logged-in users
    useEffect(() => {
        if (user && !window.location.hash.includes("token=")) {
            navigate("/workspace", { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: formData.email.trim(),
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage({
                    text:
                        data.message ||
                        "Invalid credentials or login failed.",
                    type: "error",
                });
                return;
            }

            login(data.user, data.token);

            setMessage({
                text: `Welcome back, ${
                    data.user?.name || "Developer"
                }! Redirecting...`,
                type: "success",
            });

            setTimeout(() => {
                navigate("/workspace");
            }, 900);
        } catch (error) {
            console.error("Login request error:", error);

            setMessage({
                text:
                    "Could not reach the authentication server. Please check your backend connection.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/google",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        credential: credentialResponse.credential,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage({
                    text:
                        data.message ||
                        "Google authentication failed",
                    type: "error",
                });
                return;
            }

            login(data.user, data.token);

            setMessage({
                text: "Google sign-in successful! Redirecting...",
                type: "success",
            });

            setTimeout(() => {
                navigate("/workspace");
            }, 900);
        } catch (error) {
            console.error("Google login error:", error);

            setMessage({
                text:
                    "Unable to connect to server for Google authentication.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // GitHub OAuth
    const handleGithubLogin = () => {
        setMessage({ text: "", type: "" });

        window.location.href =
            "http://localhost:5000/api/auth/github";
    };

    // Discord OAuth
    const handleDiscordLogin = () => {
        setMessage({ text: "", type: "" });

        window.location.href =
            "http://localhost:5000/api/auth/discord";
    };

    const handleLogout = () => {
        logout();
        setMessage({ text: "", type: "" });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* Brand header */}
                <div className="auth-header">
                    <div className="logo-group auth-logo-center">
                        <div className="logo-badge">⚡</div>

                        <div>
                            <h1 className="logo-title">
                                CodeHive
                            </h1>

                            <p className="logo-subtitle">
                                Real-Time Collaborative Code Editor
                            </p>
                        </div>
                    </div>

                    <h2 className="auth-title">
                        Welcome Back
                    </h2>

                    <p className="auth-description">
                        Sign in to collaborate on live code workspaces
                    </p>
                </div>

                {/* Existing session */}
                {user && (
                    <div className="auth-existing-user-banner">
                        <span>
                            Logged in as{" "}
                            <strong>{user.email}</strong>
                        </span>

                        <div className="auth-inline-actions">
                            <button
                                type="button"
                                className="btn-link-action"
                                onClick={() =>
                                    navigate("/workspace")
                                }
                            >
                                Go to Workspace →
                            </button>

                            <button
                                type="button"
                                className="btn-link-action btn-link-danger"
                                onClick={handleLogout}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}

                {/* Feedback message */}
                {message.text && (
                    <div
                        className={`auth-alert auth-alert-${message.type}`}
                    >
                        <span className="auth-alert-icon">
                            {message.type === "error"
                                ? "⚠️"
                                : "✅"}
                        </span>

                        <span className="auth-alert-text">
                            {message.text}
                        </span>
                    </div>
                )}

                {/* Login form */}
                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >
                    {/* Email */}
                    <div className="auth-input-group">
                        <label
                            className="auth-label"
                            htmlFor="login-email"
                        >
                            Email Address
                        </label>

                        <div className="input-with-icon">
                            <span className="input-icon">
                                ✉️
                            </span>

                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                className="auth-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="developer@codehive.io"
                                autoComplete="email"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="auth-input-group">
                        <div className="auth-label-row">
                            <label
                                className="auth-label"
                                htmlFor="login-password"
                            >
                                Password
                            </label>
                        </div>

                        <div className="input-with-icon">
                            <span className="input-icon">
                                🔒
                            </span>

                            <input
                                id="login-password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                className="auth-input"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                disabled={loading}
                            />

                            <button
                                type="button"
                                className="btn-toggle-password"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? "👁️" : "🙈"}
                            </button>
                        </div>
                    </div>

                    {/* Login */}
                    <button
                        type="submit"
                        className="btn-auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-inline">
                                Logging in...
                            </span>
                        ) : (
                            "Sign In to CodeHive"
                        )}
                    </button>
                </form>

                {/* OAuth */}
                <div className="auth-divider-section">
                    <span className="auth-divider-line"></span>
                    <span className="auth-divider-text">
                        OR CONTINUE WITH
                    </span>
                    <span className="auth-divider-line"></span>
                </div>

                {/* Google */}
                <div className="auth-google-container">
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => {
                            setMessage({
                                text:
                                    "Google sign-in popup was closed or encountered an error.",
                                type: "error",
                            });
                        }}
                    />
                </div>

                {/* GitHub */}
                <button
                    type="button"
                    className="github-button"
                    onClick={handleGithubLogin}
                    disabled={loading}
                >
                    <span className="github-icon">
                        ◉
                    </span>

                    <span>
                        Continue with GitHub
                    </span>
                </button>

                {/* Discord */}
                <button
                    type="button"
                    className="oauth-button discord-button"
                    onClick={handleDiscordLogin}
                    disabled={loading}
                >
                    Continue with Discord
                </button>

                {/* Footer Navigation */}
                <div className="auth-footer">
                    <p className="auth-switch-text">
                        Don't have an account yet?{" "}
                        <Link
                            to="/signup"
                            className="auth-accent-link"
                        >
                            Create an account
                        </Link>
                    </p>

                    <Link
                        to="/workspace"
                        className="auth-back-link"
                    >
                        ← Continue as Guest to Editor
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Login;