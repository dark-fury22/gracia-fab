import { useState } from "react";
import "./EditProfileModal.css";

function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Re-sync the form from `user` only on the closed→open transition —
  // adjusting state during render (rather than in an effect) avoids an
  // extra commit, and it deliberately does *not* re-sync while already
  // open so an in-progress edit is never silently overwritten.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && user) {
      const parts = (user.name || "").trim().split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setEmail(user.email || "");
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    try {
      await onSave({ name: fullName, email: email.trim() });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="edit-profile-title"
      >
        <div className="modal-header">
          <h2 id="edit-profile-title">Edit profile</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-row-names">
            <div className="modal-field">
              <label htmlFor="edit-first-name">First name</label>
              <input
                id="edit-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="modal-field">
              <label htmlFor="edit-last-name">Last name</label>
              <input
                id="edit-last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-field">
            <label htmlFor="edit-email">Email</label>
            <input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="modal-field-note">
              This email is used for sign-in and order updates.
            </span>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn-save"
              disabled={saving || !firstName.trim() || !email.trim()}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
