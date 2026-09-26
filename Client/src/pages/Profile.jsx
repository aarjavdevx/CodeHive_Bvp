import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Profile.css";

function Profile() {
    const { user, token, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState({
        text: "",
        type: "",
    });

    if (!user) {
        return (
            <div className="auth-page">
                <div className="auth-card text-center">
                    <div className="auth-header">
                        <div className="profile-avatar-placeholder">
                            👤
                        </div>

                        <h2 className="auth-title">
                            Authentication Required
                        </h2>

                        <p className="auth-description">
                            Please sign in to view and manage your
                            CodeHive developer profile.
                        </p>
                    </div>

                    <div className="auth-button-group">
                        <Link
                            to="/login"
                            className="btn-auth-submit text-center"
                            style={{ textDecoration: "none" }}
                        >
                            Sign In Now
                        </Link>

                        <Link
                            to="/workspace"
                            className="auth-back-link"
                        >
                            ← Return to Collaborative Editor
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleSave = async (e) => {
        e.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setStatusMessage({
                text: "Name cannot be empty.",
                type: "error",
            });
            return;
        }

        setSaving(true);
        setStatusMessage({
            text: "",
            type: "",
        });

        try {
            const authToken =
                token || localStorage.getItem("token");

            if (!authToken) {
                setStatusMessage({
                    text: "Authentication required. Please login again.",
                    type: "error",
                });
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/auth/profile",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        name: trimmedName,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setStatusMessage({
                    text:
                        data.message ||
                        "Failed to update profile.",
                    type: "error",
                });
                return;
            }

            // Preserve existing fields such as profilePicture
            // and authProvider while updating the returned data.
            const updatedUser = {
                ...user,
                ...data.user,
            };

            updateUser(updatedUser);

            setName(updatedUser.name || "");
            setIsEditing(false);

            setStatusMessage({
                text: "Profile updated successfully!",
                type: "success",
            });
        } catch (error) {
            console.error(
                "Profile update error:",
                error
            );

            setStatusMessage({
                text:
                    "Could not reach server to save profile changes.",
                type: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setName(user.name || "");
        setIsEditing(false);

        setStatusMessage({
            text: "",
            type: "",
        });
    };

    const handleEdit = () => {
        setName(user.name || "");

        setStatusMessage({
            text: "",
            type: "",
        });

        setIsEditing(true);
    };

    const providerName = user.authProvider
        ? user.authProvider.charAt(0).toUpperCase() +
          user.authProvider.slice(1)
        : "Local";

    const getInitials = (userName) => {
        if (!userName) return "U";

        return userName
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="auth-page">
            <div className="auth-card profile-card">

                {/* Header */}
                <div className="auth-header profile-header">
                    <div className="profile-avatar-badge">
                        {user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt="Profile"
                                className="profile-img-avatar"
                            />
                        ) : (
                            <span className="profile-avatar-initials">
                                {getInitials(
                                    user.name || user.email
                                )}
                            </span>
                        )}
                    </div>

                    <h2 className="auth-title">
                        {user.name || "Developer"}
                    </h2>

                    <p className="auth-description">
                        {user.email}
                    </p>
                </div>

                {/* Status Alert */}
                {statusMessage.text && (
                    <div
                        className={`auth-alert auth-alert-${statusMessage.type}`}
                    >
                        <span className="auth-alert-icon">
                            {statusMessage.type === "error"
                                ? "⚠️"
                                : "✅"}
                        </span>

                        <span className="auth-alert-text">
                            {statusMessage.text}
                        </span>
                    </div>
                )}

                {/* Profile Details */}
                <div className="profile-details-grid">

                    {/* Name */}
                    <div className="profile-field-row">
                        <span className="profile-field-label">
                            Full Name
                        </span>

                        {isEditing ? (
                            <form
                                onSubmit={handleSave}
                                className="profile-edit-inline-form"
                            >
                                <input
                                    type="text"
                                    className="auth-input profile-edit-input"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    autoFocus
                                    required
                                    disabled={saving}
                                />

                                <div className="profile-inline-buttons">
                                    <button
                                        type="submit"
                                        className="btn-pill-save"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Save"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-pill-cancel"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-field-value-group">
                                <span className="profile-field-value">
                                    {user.name || "Not set"}
                                </span>

                                <button
                                    type="button"
                                    className="btn-edit-trigger"
                                    onClick={handleEdit}
                                >
                                    ✏️ Edit
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="profile-field-row">
                        <span className="profile-field-label">
                            Email Address
                        </span>

                        <div className="profile-field-value-group">
                            <span className="profile-field-value">
                                {user.email}
                            </span>

                            <span className="verified-badge">
                                ✓ Verified
                            </span>
                        </div>
                    </div>

                    {/* Authentication Provider */}
                    <div className="profile-field-row">
                        <span className="profile-field-label">
                            Authentication
                        </span>

                        <div className="profile-field-value-group">
                            <span className="active-session-pill">
                                ● {providerName} Account
                            </span>
                        </div>
                    </div>

                    {/* Session */}
                    <div className="profile-field-row">
                        <span className="profile-field-label">
                            Session Status
                        </span>

                        <div className="profile-field-value-group">
                            <span className="active-session-pill">
                                ● Active Token
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="profile-actions-section">
                    <button
                        type="button"
                        className="btn-auth-submit"
                        onClick={() =>
                            navigate("/workspace")
                        }
                    >
                        ⚡ Open Collaborative Workspace
                    </button>

                    <button
                        type="button"
                        className="btn-signout-outline"
                        onClick={() => {
                            logout();
                            navigate("/login", {
                                replace: true,
                            });
                        }}
                        disabled={saving}
                    >
                        Sign Out
                    </button>
                </div>

                {/* Footer */}
                <div className="auth-footer text-center">
                    <Link
                        to="/workspace"
                        className="auth-back-link"
                    >
                        ← Back to Collaborative Editor
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Profile;