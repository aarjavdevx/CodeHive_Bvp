import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
    const { login, logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        setMessage("");
    };

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
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
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Login failed");
                return;
            }

            login(data.user, data.token);

            setMessage("Login successful!");

            console.log("Login response:", data);

        } catch (error) {
            console.error("Login error:", error);
            setMessage("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/google",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    credential: credentialResponse.credential
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setMessage(data.message || "Google login failed");
            return;
        }

        login(data.user, data.token);
        setMessage("Google login successful!");

        console.log("Google login response:", data);
    } catch (error) {
        console.error("Google login error:", error);
        setMessage("Unable to connect to server");
    }
};

    return (
        <div>
            <h1>Login to CodeHive</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div>
                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <div style={{ marginTop: "20px" }}>
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => {
                            setMessage("Google login failed");
                        }}
                    />
                </div>

            </form>

            {user && (
            <div>
                <p>Logged in as: {user.email}</p>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        )}

            {message && (
                <p>{message}</p>
            )}
        </div>
    );
}

export default Login;