import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");

        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        if (formData.password.length < 6) {
            setMessage(
                "Password must be at least 6 characters long."
            );
            return;
        }

        try {
            setLoading(true);

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
                setMessage(
                    data.message || "Signup failed."
                );
                return;
            }

            if (data.user && data.token) {
                login(data.user, data.token);

                setMessage(
                    "Account created successfully!"
                );

                setTimeout(() => {
                    navigate("/profile");
                }, 500);

                return;
            }

            setMessage(
                "Account created successfully!"
            );

            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error("Signup error:", error);

            setMessage(
                "Unable to connect to server."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async (
        credentialResponse
    ) => {
        try {
            setLoading(true);
            setMessage("");

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
                setMessage(
                    data.message ||
                        "Google signup failed."
                );
                return;
            }

            login(data.user, data.token);

            setMessage(
                "Google signup successful!"
            );

            setTimeout(() => {
                navigate("/profile");
            }, 500);
        } catch (error) {
            console.error(
                "Google signup error:",
                error
            );

            setMessage(
                "Unable to connect to server."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGithubSignup = () => {
        setMessage("");

        window.location.href =
            "http://localhost:5000/api/auth/github";
    };

    return (
        <div className="signup-page">
            <div className="signup-container">

                {/* =========================
                    BRANDING SECTION
                ========================== */}

                <div className="signup-brand">

                    <div className="signup-logo">
                        ⚡
                    </div>

                    <h1>CodeHive</h1>

                    <p className="signup-tagline">
                        Build. Collaborate. Grow.
                    </p>

                    <p className="signup-description">
                        Create your developer account and
                        start building amazing projects
                        with your team.
                    </p>

                    <div className="signup-features">

                        <div className="signup-feature">
                            <span>👥</span>

                            <div>
                                <strong>
                                    Collaborate
                                </strong>

                                <small>
                                    Work together with
                                    other developers.
                                </small>
                            </div>
                        </div>

                        <div className="signup-feature">
                            <span>⚡</span>

                            <div>
                                <strong>
                                    Code Faster
                                </strong>

                                <small>
                                    A workspace designed
                                    for developers.
                                </small>
                            </div>
                        </div>

                        <div className="signup-feature">
                            <span>🚀</span>

                            <div>
                                <strong>
                                    Build Projects
                                </strong>

                                <small>
                                    Turn your ideas into
                                    real applications.
                                </small>
                            </div>
                        </div>

                    </div>
                </div>

                {/* =========================
                    SIGNUP CARD
                ========================== */}

                <div className="signup-card">

                    <div className="signup-header">

                        <span className="signup-badge">
                            Get Started
                        </span>

                        <h2>
                            Create your account
                        </h2>

                        <p>
                            Join CodeHive and start
                            building together
                        </p>

                    </div>

                    <form
                        className="signup-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Name */}

                        <div className="signup-form-group">

                            <label htmlFor="signup-name">
                                Name
                            </label>

                            <div className="signup-input-wrapper">

                                <span className="signup-input-icon">
                                    👤
                                </span>

                                <input
                                    id="signup-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    required
                                    disabled={loading}
                                />

                            </div>
                        </div>

                        {/* Email */}

                        <div className="signup-form-group">

                            <label htmlFor="signup-email">
                                Email
                            </label>

                            <div className="signup-input-wrapper">

                                <span className="signup-input-icon">
                                    ✉
                                </span>

                                <input
                                    id="signup-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                    disabled={loading}
                                />

                            </div>
                        </div>

                        {/* Password */}

                        <div className="signup-form-group">

                            <label htmlFor="signup-password">
                                Password
                            </label>

                            <div className="signup-input-wrapper">

                                <span className="signup-input-icon">
                                    🔒
                                </span>

                                <input
                                    id="signup-password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    required
                                    disabled={loading}
                                />

                            </div>

                            <small className="password-hint">
                                Minimum 6 characters
                            </small>

                        </div>

                        {/* Confirm Password */}

                        <div className="signup-form-group">

                            <label htmlFor="signup-confirm-password">
                                Confirm Password
                            </label>

                            <div className="signup-input-wrapper">

                                <span className="signup-input-icon">
                                    🔐
                                </span>

                                <input
                                    id="signup-confirm-password"
                                    type="password"
                                    name="confirmPassword"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    required
                                    disabled={loading}
                                />

                            </div>

                        </div>

                        {/* Signup Button */}

                        <button
                            type="submit"
                            className="signup-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="signup-spinner"></span>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <span>→</span>
                                </>
                            )}
                        </button>

                        {/* Divider */}

                        <div className="signup-divider">
                            <span>
                                OR CONTINUE WITH
                            </span>
                        </div>

                        {/* Google */}

                        <div className="google-signup-wrapper">

                            <GoogleLogin
                                onSuccess={
                                    handleGoogleSignup
                                }
                                onError={() => {
                                    setMessage(
                                        "Google signup failed."
                                    );
                                }}
                                theme="filled_black"
                                size="large"
                                width="100%"
                            />

                        </div>

                        {/* GitHub */}

                        <button
                            type="button"
                            className="github-signup-button"
                            onClick={
                                handleGithubSignup
                            }
                            disabled={loading}
                        >
                            <span className="github-signup-icon">
                                ◉
                            </span>

                            Continue with GitHub
                        </button>

                    </form>

                    {/* Message */}

                    {message && (
                        <div
                            className={`signup-message ${
                                message
                                    .toLowerCase()
                                    .includes("successful")
                                    ? "success"
                                    : "error"
                            }`}
                        >
                            <span>
                                {message
                                    .toLowerCase()
                                    .includes("successful")
                                    ? "✓"
                                    : "!"}
                            </span>

                            {message}
                        </div>
                    )}

                    {/* Footer */}

                    <div className="signup-footer">

                        <span>⚡ CodeHive</span>

                        <span>•</span>

                        <span>
                            Secure Authentication
                        </span>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default Signup;