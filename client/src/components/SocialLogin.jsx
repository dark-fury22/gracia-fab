import { useGoogleLogin } from "@react-oauth/google";
import "./SocialLogin.css";

const saveAndRedirect = (data) => {
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
  window.location.href = "/";
};

function GoogleButton() {
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Send only the raw access token — the server verifies it with
        // Google itself and derives the profile server-side, rather than
        // trusting a client-supplied identity payload.
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        saveAndRedirect(data);
      } catch (err) {
        console.error("Google login failed:", err);
        alert("Google login failed: " + err.message);
      }
    },
    onError: (err) => console.error("Google OAuth error:", err),
  });

  return (
    <button
      type="button"
      className="social-btn social-google"
      onClick={handleGoogleLogin}
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path
          fill="#4285F4"
          d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"
        />
        <path
          fill="#34A853"
          d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"
        />
        <path
          fill="#FBBC05"
          d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"
        />
        <path
          fill="#EA4335"
          d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"
        />
      </svg>
      Continue with Google
    </button>
  );
}

function SocialLogin() {
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  if (!hasGoogleClientId) {
    return (
      <div className="social-login">
        <div className="social-buttons">
          <button
            type="button"
            className="social-btn social-google"
            onClick={() => {
              alert(
                "Google Sign-In requires VITE_GOOGLE_CLIENT_ID in .env. For quick testing, you can sign in directly with email & password below!",
              );
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"
              />
              <path
                fill="#34A853"
                d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"
              />
              <path
                fill="#FBBC05"
                d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"
              />
              <path
                fill="#EA4335"
                d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="social-login">
      <div className="social-buttons">
        <GoogleButton />
      </div>
    </div>
  );
}

export default SocialLogin;
