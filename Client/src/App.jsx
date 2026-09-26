import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Workspace from "./pages/Workspace";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Collaborative Workspace (accessible directly or via /workspace) */}
        <Route path="/" element={<Workspace />} />
        <Route path="/workspace" element={<Workspace />} />

        {/* Teammate Authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;