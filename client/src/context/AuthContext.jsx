import { createContext, useState, useEffect, useContext } from "react";
import config from "../config";

// Create the context
const AuthContext = createContext();

// Provider component — wraps the whole app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Register function
  const register = async (name, email, password) => {
    const response = await fetch("${config.API_URL}/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    // Save to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
      }),
    );

    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      isAdmin: data.isAdmin,
    });

    return data;
  };

  // Login function
  const login = async (email, password) => {
    const response = await fetch("${config.API_URL}/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Save to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
      }),
    );

    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      isAdmin: data.isAdmin,
    });

    return data;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook — makes using the context easy
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
