import { useState, useEffect } from "react";
import API_URL from "../config";
import { AuthContext } from "../hooks/useAuth";

// Provider component — wraps the whole app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Saves a successful login/register response and establishes the session.
  const persistSession = (data) => {
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
  };

  // On app load, check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      // One-time sync from localStorage on mount — not a value derivable
      // from props/state at render time.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Register function
  const register = async (name, email, password) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    persistSession(data);
    return data;
  };

  // Login function — step 1: verify the password. Normally the server
  // withholds the session token until the OTP it just emailed is confirmed
  // via verifyOtp, returning only { requiresOtp: true, email }. If email
  // delivery itself isn't working, the server instead fails open and
  // returns a token directly, same as a pre-OTP login — handle both.
  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (data.token) {
      persistSession(data);
    }

    return data;
  };

  // Login function — step 2: confirm the emailed OTP and establish the session.
  const verifyOtp = async (email, code) => {
    const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Verification failed");
    }

    persistSession(data);
    return data;
  };

  // Requests a fresh OTP for a pending login.
  const resendOtp = async (email) => {
    const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to resend code");
    }

    return data;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, verifyOtp, resendOtp, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
