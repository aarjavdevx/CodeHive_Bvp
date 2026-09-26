import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle GitHub OAuth callback
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

                setMessage("GitHub login successful!");

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

                setMessage("GitHub login failed.");
            }
        }
    }, [login]);

    useEffect(() => {
        if (user && !window.location.hash.includes("token=")) {
            navigate("/profile", { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Login failed."
                );
                return;
            }

            login(data.user, data.token);

            setMessage("Login successful!");

            setTimeout(() => {
                navigate("/profile");
            },500);
        } catch (error) {
            console.error("Login error:", error);
            setMessage(
                "Unable to connect to server."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (
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
                        "Google login failed."
                );
                return;
            }

            login(data.user, data.token);

            setMessage("Google login successful!");

            setTimeout(() => {
                navigate("/profile");
            }, 500);
        } catch (error) {
            console.error(
                "Google login error:",
                error
            );

            setMessage(
                "Unable to connect to server."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGithubLogin = () => {
        setMessage("");
        window.location.href =
            "http://localhost:5000/api/auth/github";
    };

    const handleLogout = () => {
        logout();
        setMessage("");
    };

    const handleDiscordLogin = () => {
        setMessage("");
        window.location.href =
            "http://localhost:5000/api/auth/discord";
    };

    return (
        <div className="login-page">

            <div className="login-container">

                {/* Left Branding Section */}
                <div className="login-brand">

                    <div className="brand-logo">
                        ⚡
                    </div>

                    <h1>CodeHive</h1>

                    <p className="brand-tagline">
                        Collaborate. Code. Create.
                    </p>

                    <p className="brand-description">
                        Your collaborative coding workspace
                        built for developers who build together.
                    </p>

                    <div className="brand-features">

                        <div className="brand-feature">
                            <span>⚡</span>
                            <div>
                                <strong>Real-Time Collaboration</strong>
                                <small>
                                    Code together with your team.
                                </small>
                            </div>
                        </div>

                        <div className="brand-feature">
                            <span>💻</span>
                            <div>
                                <strong>Developer Workspace</strong>
                                <small>
                                    Build and experiment together.
                                </small>
                            </div>
                        </div>

                        <div className="brand-feature">
                            <span>🚀</span>
                            <div>
                                <strong>Build Faster</strong>
                                <small>
                                    Turn ideas into working projects.
                                </small>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Login Card */}
                <div className="login-card">

                    <div className="login-header">
                        <span className="login-badge">
                            Welcome Back
                        </span>

                        <h2>Sign in to CodeHive</h2>

                        <p>
                            Continue your coding journey
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="login-form"
                    >

                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="email">
                                Email
                            </label>

                            <div className="input-wrapper">
                                <span className="input-icon">
                                    ✉
                                </span>

                                <input
                                    id="email"
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
                        <div className="form-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="input-wrapper">
                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="login-spinner"></span>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Login
                                    <span>→</span>
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="login-divider">
                            <span>OR CONTINUE WITH</span>
                        </div>

                        {/* Google */}
                        <div className="google-login-wrapper">
                            <GoogleLogin
                                onSuccess={
                                    handleGoogleLogin
                                }
                                onError={() => {
                                    setMessage(
                                        "Google login failed."
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

                        <button
                            type="button"
                            className="oauth-button discord-button"
                            onClick={handleDiscordLogin}
                        >
                            Continue with Discord
                        </button>

                    </form>

                    {/* Message */}
                    {message && (
                        <div
                            className={`login-message ${
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

                    {/* Logged-in State */}
                    {user && (
                        <div className="logged-user">

                            <div className="logged-user-avatar">
                                {user.name
                                    ?.charAt(0)
                                    .toUpperCase() || "U"}
                            </div>

                            <div className="logged-user-info">
                                <span>
                                    Logged in as
                                </span>

                                <strong>
                                    {user.email}
                                </strong>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="small-logout"
                            >
                                Logout
                            </button>

                        </div>
                    )}

                    <div className="login-footer">
                        <span>⚡ CodeHive</span>
                        <span>•</span>
                        <span>Secure Authentication</span>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;