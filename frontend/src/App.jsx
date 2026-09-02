import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/common/PrivateRoute";
import Navbar from "./components/common/Navbar";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AuthSuccess from "./pages/AuthSuccess";
import Dashboard from "./pages/Dashboard";
import Threats from "./pages/Threats";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Dashboard />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/threats"
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Threats />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Analytics />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Settings />
                  </>
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}
export default App;
