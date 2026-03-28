import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Profile section
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password section
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Delete section
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setUsername(res.data.username);
        setEmail(res.data.email);
        setBio(res.data.bio || "");
      } catch (err) {
        setProfileError("Failed to load profile.");
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileSuccess("");

    if (bio.length > 300) {
      setProfileError("Bio must be 300 characters or less.");
      return;
    }

    if (username.trim().length < 3) {
      setProfileError("Username must be at least 3 characters.");
      return;
    }

    try {
      await api.put("/users/me", {
        username: username.trim(),
        email: email.trim(),
        bio: bio.trim(),
      });
      setProfileSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setProfileError("That username or email is already taken.");
      } else {
        setProfileError("Failed to update profile.");
      }
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    try {
      await api.put("/users/me/password", {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setPasswordError("Current password is incorrect.");
      } else {
        setPasswordError("Failed to update password.");
      }
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");

    try {
      await api.delete("/users/me", {
        data: { currentPassword: deletePassword },
      });
      logout();
      navigate("/");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setDeleteError("Incorrect password.");
      } else {
        setDeleteError("Failed to delete account.");
      }
    }
  };

  return (
    <main className="page">
      <div className="settings-container">
        <h1>Settings</h1>

        {/* ── Profile ── */}
        <section>
          <h2>Profile</h2>

          {!isEditing ? (
            <>
              <p><strong>Username:</strong> {username}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Bio:</strong> {bio || "No bio yet"}</p>
              {profileSuccess && <p style={{ color: "green" }}>{profileSuccess}</p>}
              {profileError && <p style={{ color: "red" }}>{profileError}</p>}
              <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            </>
          ) : (
            <>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio (max 300 characters)"
                maxLength={300}
              />
              {profileError && <p style={{ color: "red" }}>{profileError}</p>}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
                <button onClick={handleSaveProfile}>Save Changes</button>
              </div>
            </>
          )}
        </section>

        {/* ── Password ── */}
        <section style={{ marginTop: "30px" }}>
          <h2>Password</h2>

          {!showPasswordForm ? (
            <>
              {passwordSuccess && <p style={{ color: "green" }}>{passwordSuccess}</p>}
              <button onClick={() => setShowPasswordForm(true)}>Change Password</button>
            </>
          ) : (
            <>
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowPasswordForm(false)}>Cancel</button>
                <button onClick={handlePasswordChange}>Update Password</button>
              </div>
            </>
          )}
        </section>

        {/* ── Delete Account ── */}
        <section style={{ marginTop: "30px" }}>
          <h2>Delete Account</h2>

          {!showDeleteConfirm ? (
            <button
              style={{
                background: "#ef4444",
                color: "white",
                padding: "10px",
                borderRadius: "8px",
                width: "100%",
              }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          ) : (
            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                border: "1px solid #eee",
                borderRadius: "10px",
                background: "#fff5f5",
              }}
            >
              <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                Are you sure? This cannot be undone.
              </p>
              <input
                type="password"
                placeholder="Enter your password to confirm"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                style={{ marginBottom: "10px", width: "100%" }}
              />
              {deleteError && (
                <p style={{ color: "red", marginBottom: "10px" }}>{deleteError}</p>
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  style={{ background: "#ef4444", color: "white" }}
                  onClick={handleDeleteAccount}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Settings;