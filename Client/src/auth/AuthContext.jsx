import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => localStorage.getItem("token") || "");

    const login = (userData, authToken) => {
        localStorage.setItem("token", authToken || "");
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setToken(authToken || "");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setToken("");
    };

    const updateUser = (updatedFields) => {
        setUser((prev) => {
            const next = { ...prev, ...updatedFields };
            localStorage.setItem("user", JSON.stringify(next));
            return next;
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};