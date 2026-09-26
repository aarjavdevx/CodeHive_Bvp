import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import "./Signup.css";

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
    const [message, setMessage] = useState({
        text: "",
        type: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage({
            text: "",
            type: "",
        });

        if (!formData.name.trim()) {
            setMessage({
                text: "Please enter your name.",
                type: "error",
            });
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
            const response = await fetch(
                "http://localhost:5000/api/auth/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
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
                        "Registration failed. Please try again.",
                    type: "error",
                });
                return;
            }

            if (data.user && data.token) {
                login(data.user, data.token);

                setMessage({
                    text:
                        "Account created successfully! Preparing your workspace...",
                    type: "success",
                });

                setTimeout(() => {
                    navigate("/workspace");
                }, 900);

                return;
            }

            setMessage({
                text: "Account created successfully!",
                type: "success",
            });

            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error("Signup network error:", error);

            setMessage({
                text:
                    "Unable to connect to the authentication server.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async (credentialResponse) => {
        setLoading(true);

        setMessage({
            text: "",
            type: "",
        });

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/google",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        credential:
                            credentialResponse.credential,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage({
                    text:
                        data.message ||
                        "Google authentication failed.",
                    type: "error",
                });
                return;
            }

            login(data.user, data.token);

            setMessage({
                text:
                    "Google sign-up successful! Redirecting...",
                type: "success",
            });

            setTimeout(() => {
                navigate("/workspace");
            }, 900);
        } catch (error) {
            console.error("Google signup error:", error);

            setMessage({
                text:
                    "Unable to connect to server for Google authentication.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGithubSignup = () => {
        setMessage({
            text: "",
            type: "",
        });

        window.location.href =
            "http://localhost:5000/api/auth/github";
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* Header */}
                <div className="auth-header">
                    <div className="logo-group auth-logo-center">
                        <div className="logo-badge">
                            ⚡
                        </div>

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
                        Create Account
                    </h2>

                    <p className="auth-description">
                        Join CodeHive to create rooms,
                        collaborate, and edit code in real-time
                    </p>
                </div>

                {/* Message */}
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

                {/* Signup Form */}
                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >
                    {/* Name */}
                    <div className="auth-input-group">
                        <label
                            className="auth-label"
                            htmlFor="signup-name"
                        >
                            Full Name
                        </label>

                        <div className="input-with-icon">
                            <span className="input-icon">
                                👤
                            </span>

                            <input
                                id="signup-name"
                                type="text"
                                name="name"
                                className="auth-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                autoComplete="name"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="auth-input-group">
                        <label
                            className="auth-label"
                            htmlFor="signup-email"
                        >
                            Email Address
                        </label>

                        <div className="input-with-icon">
                            <span className="input-icon">
                                ✉️
                            </span>

                            <input
                                id="signup-email"
                                type="email"
                                name="email"
                                className="auth-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
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
                                htmlFor="signup-password"
                            >
                                Password
                            </label>

                            <span className="auth-hint">
                                Min 6 characters
                            </span>
                        </div>

                        <div className="input-with-icon">
                            <span className="input-icon">
                                🔒
                            </span>

                            <input
                                id="signup-password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                className="auth-input"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Choose a strong password"
                                autoComplete="new-password"
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
                                {showPassword
                                    ? "👁️"
                                    : "🙈"}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="auth-input-group">
                        <label
                            className="auth-label"
                            htmlFor="signup-confirm-password"
                        >
                            Confirm Password
                        </label>

                        <div className="input-with-icon">
                            <span className="input-icon">
                                🛡️
                            </span>

                            <input
                                id="signup-confirm-password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                className="auth-input"
                                value={
                                    formData.confirmPassword
                                }
                                onChange={handleChange}
                                placeholder="Re-type your password"
                                autoComplete="new-password"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Signup Button */}
                    <button
                        type="submit"
                        className="btn-auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-inline">
                                Creating account...
                            </span>
                        ) : (
                            "Sign Up to CodeHive"
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
                        onSuccess={handleGoogleSignup}
                        onError={() => {
                            setMessage({
                                text:
                                    "Google sign-up failed.",
                                type: "error",
                            });
                        }}
                    />
                </div>

                {/* GitHub */}
                <button
                    type="button"
                    className="github-signup-button"
                    onClick={handleGithubSignup}
                    disabled={loading}
                >
                    <span className="github-signup-icon">
                        ◉
                    </span>

                    Continue with GitHub
                </button>

                {/* Footer */}
                <div className="auth-footer">
                    <p className="auth-switch-text">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="auth-accent-link"
                        >
                            Sign In
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

export default Signup;