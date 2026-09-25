import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

function Profile() {
    const { user, logout } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || "");

    if (!user) {
        return (
            <div>
                <h1>Profile</h1>
                <p>Please login to view your profile.</p>
            </div>
        );
    }

    const handleSave = () => {
        // For now, update only the local profile display.
        // Backend profile update will be added next.
        setIsEditing(false);
    };

    return (
        <div>
            <h1>My Profile</h1>

            <div>
                <h2>Profile Information</h2>

                <div>
                    <label>Name</label>

                    {isEditing ? (
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    ) : (
                        <p>{name}</p>
                    )}
                </div>

                <div>
                    <label>Email</label>
                    <p>{user.email}</p>
                </div>

                {isEditing ? (
                    <div>
                        <button onClick={handleSave}>
                            Save
                        </button>

                        <button onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </button>
                )}

                <br />
                <br />

                <button onClick={logout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Profile;