// import { useState } from "react";
// import { useAuth } from "../auth/AuthContext";
// import "./Profile.css";

// function Profile() {
//     const { user, logout, updateUser } = useAuth();

//     const [isEditing, setIsEditing] = useState(false);
//     const [name, setName] = useState(user?.name || "");
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState("");

//     if (!user) {
//         return (
//             <div>
//                 <h1>Profile</h1>
//                 <p>Please login to view your profile.</p>
//             </div>
//         );
//     }

//     const handleSave = async () => {
//     if (!name.trim()) {
//         setMessage("Name cannot be empty.");
//         return;
//     }

//     try {
//         setLoading(true);
//         setMessage("");

//         const token = localStorage.getItem("token");

//         const response = await fetch(
//             "http://localhost:5000/api/auth/profile",
//             {
//                 method: "PUT",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({
//                     name: name.trim(),
//                 }),
//             }
//         );

//         const data = await response.json();

//         if (!response.ok) {
//             setMessage(data.message || "Profile update failed.");
//             return;
//         }

//         updateUser(data.user);
//         setName(data.user.name);
//         setIsEditing(false);
//         setMessage("Profile updated successfully.");
//     } catch (error) {
//         console.error("Profile update error:", error);
//         setMessage("Unable to update profile.");
//     } finally {
//         setLoading(false);
//     }
// };

//     return (
//         <div>

//             {user.profilePicture && (
//                 <div>
//                     <img
//                         src={user.profilePicture}
//                         alt="Profile"
//                         width="120"
//                         height="120"
//                         style={{
//                             borderRadius: "50%",
//                             objectFit: "cover",
//                         }}
//                     />
//                 </div>
//             )}

//             <h1>My Profile</h1>

//             <div>
//                 <h2>Profile Information</h2>

//                 <div>
//                     <label>Name</label>

//                     {isEditing ? (
//                         <input
//                             type="text"
//                             value={name}
//                             onChange={(e) => setName(e.target.value)}
//                         />
//                     ) : (
//                         <p>{name}</p>
//                     )}
//                 </div>

//                 <div>
//                     <label>Email</label>
//                     <p>{user.email}</p>
//                 </div>

//                 <div>
//                     <label>Authentication Provider</label>
//                     <p>{user.authProvider || "local"}</p>
//                 </div>

//                 {isEditing ? (
//                     <div>
//                     <button onClick={handleSave} disabled={loading}>
//                         {loading ? "Saving..." : "Save"}
//                     </button>

//                         <button
//                             onClick={() => {
//                                 setName(user.name);
//                                 setIsEditing(false);
//                                 setMessage("");
//                             }}
//                             disabled={loading}
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 ) : (
//                     <button onClick={() => setIsEditing(true)}>
//                         Edit Profile
//                     </button>
//                 )}

//                 <br />
//                 <br />

//                 <button onClick={logout}>
//                     Logout
//                 </button>
//             </div>
//         </div>
//     );
// }

// export default Profile;



import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Profile.css";

function Profile() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-card empty-profile">
                    <div className="empty-icon">👤</div>
                    <h1>Profile</h1>
                    <p>Please login to view your profile.</p>
                </div>
            </div>
        );
    }

    const handleSave = async () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            setMessage("Name cannot be empty.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const token = localStorage.getItem("token");

            if (!token) {
                setMessage("Authentication required. Please login again.");
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/auth/profile",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: trimmedName,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Profile update failed."
                );
                return;
            }

            /*
             * Preserve existing user information such as
             * profilePicture and authProvider because the backend
             * currently returns only id, name and email.
             */
            const updatedUser = {
                ...user,
                ...data.user,
            };

            updateUser(updatedUser);

            setName(updatedUser.name);
            setIsEditing(false);
            setMessage("Profile updated successfully.");
        } catch (error) {
            console.error("Profile update error:", error);
            setMessage("Unable to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setName(user.name || "");
        setIsEditing(false);
        setMessage("");
    };

    const handleEdit = () => {
        setName(user.name || "");
        setMessage("");
        setIsEditing(true);
    };

    const providerName = user.authProvider
        ? user.authProvider.charAt(0).toUpperCase() +
          user.authProvider.slice(1)
        : "Local";

    const avatarLetter = user.name
        ? user.name.charAt(0).toUpperCase()
        : "U";

    return (
        <div className="profile-page">
            <div className="profile-card">

                {/* Header */}
                <div className="profile-header">
                    <span className="profile-badge">
                        ⚡ CodeHive
                    </span>

                    <h1>My Profile</h1>

                    <p>
                        Manage your account information
                    </p>
                </div>

                {/* Profile Avatar */}
                <div className="avatar-section">
                    <div className="avatar-wrapper">
                        {user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt="Profile"
                                className="profile-avatar"
                            />
                        ) : (
                            <div className="profile-avatar fallback-avatar">
                                {avatarLetter}
                            </div>
                        )}

                        <div className="online-indicator"></div>
                    </div>

                    <h2>{user.name}</h2>

                    <span className="provider-badge">
                        {providerName} Account
                    </span>
                </div>

                {/* Account Information */}
                <div className="profile-info">

                    <div className="section-heading">
                        <div className="section-icon">
                            👤
                        </div>

                        <div>
                            <h3>Account Information</h3>
                            <p>Your account details</p>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="info-group">
                        <label htmlFor="profile-name">
                            Name
                        </label>

                        {isEditing ? (
                            <input
                                id="profile-name"
                                className="profile-input"
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Enter your name"
                                autoFocus
                                disabled={loading}
                            />
                        ) : (
                            <div className="info-value">
                                {user.name}
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="info-group">
                        <label>Email</label>

                        <div className="info-value">
                            {user.email}
                        </div>
                    </div>

                    {/* Authentication Provider */}
                    <div className="info-group">
                        <label>Authentication</label>

                        <div className="info-value provider-value">
                            <span className="status-dot"></span>

                            <span>
                                {providerName}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`profile-message ${
                            message.toLowerCase().includes("success")
                                ? "success"
                                : "error"
                        }`}
                    >
                        <span>
                            {message.toLowerCase().includes("success")
                                ? "✓"
                                : "!"}
                        </span>

                        {message}
                    </div>
                )}

                {/* Actions */}
                <div className="profile-actions">

                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        ✓ Save Changes
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleEdit}
                        >
                            ✎ Edit Profile
                        </button>
                    )}

                    <button
                        type="button"
                        className="btn btn-logout"
                        onClick={() => {
                            logout();
                            navigate("/login", { replace: true });
                        }}
                        disabled={loading}
                    >
                        ↪ Logout
                    </button>
                </div>

                {/* Footer */}
                <div className="profile-footer">
                    <span>CodeHive</span>
                    <span>•</span>
                    <span>Account Settings</span>
                </div>
            </div>
        </div>
    );
}

export default Profile;