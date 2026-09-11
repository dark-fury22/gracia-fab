import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import GraciaLogo from "../components/GraciaLogo";
import SEO from "../components/SEO";
import "./VerifyCode.css";

function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "est0295@gmail.com";
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit if all 6 digits are filled
    const fullCode = newDigits.join("");
    if (fullCode.length === 6 && !newDigits.includes("")) {
      handleComplete(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    const nextFocus = Math.min(pasted.length, 5);
    if (inputRefs.current[nextFocus]) {
      inputRefs.current[nextFocus].focus();
    }

    if (pasted.length === 6) {
      handleComplete(pasted);
    }
  };

  const handleComplete = (code) => {
    setVerifying(true);
    setError("");
    setTimeout(() => {
      // Mock verification success
      setVerifying(false);
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="verify-page">
      <SEO
        title="Enter Code"
        description="Verify your Gracia Fab account with your 6-digit one-time code."
        url="/verify-code"
      />

      <div className="verify-shell">
        <Link to="/" className="verify-logo-link" title="Gracia Fab Home">
          <GraciaLogo size="lg" variant="editorial" />
        </Link>

        <div className="verify-card">
          <h1 className="verify-title">Enter code</h1>
          <p className="verify-sub">
            Sent to {email}{" "}
            <Link to="/login" className="verify-change-link">
              Change
            </Link>
          </p>

          {error && <div className="verify-error">{error}</div>}

          <div className="verify-inputs" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <div key={idx} className="verify-box-wrap">
                <input
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`verify-digit-box ${digit ? "filled" : ""}`}
                  disabled={verifying}
                  aria-label={`Digit ${idx + 1}`}
                />
                {verifying && idx === 2 && (
                  <div className="verify-inline-spinner" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="verify-footer">
        <Link to="/" className="verify-privacy-link">
          Privacy policy
        </Link>
      </div>
    </div>
  );
}

export default VerifyCode;
