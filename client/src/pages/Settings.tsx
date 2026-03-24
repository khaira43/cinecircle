import { useState } from "react";
import { useAuth } from "../context/useAuth";

const Settings = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState("");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const handleSaveProfile = () => {
    localStorage.setItem("bio", bio);
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (currentPassword !== "123456") {
      setPasswordError("Current password incorrect");
      return;
    }

    setPasswordError("");
    alert("Password updated (mock)");
    setShowPasswordForm(false);
  };

  return (
    <main className="page">
      <div className="settings-container">
        <h1>Settings</h1>

        <section>
          <h2>Profile</h2>

          {!isEditing ? (
            <>
              <p><strong>Username:</strong> {username}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Bio:</strong> {bio || "No bio yet"}</p>

              <button onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
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
                placeholder="Bio"
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button onClick={handleSaveProfile}>
                  Save Changes
                </button>
              </div>
            </>
          )}
        </section>

        <section style={{ marginTop: "30px" }}>
          <h2>Password</h2>

          {!showPasswordForm ? (
            <button onClick={() => setShowPasswordForm(true)}>
              Change Password
            </button>
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

              {passwordError && (
                <p style={{ color: "red" }}>{passwordError}</p>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowPasswordForm(false)}>
                  Cancel
                </button>

                <button onClick={handlePasswordChange}>
                  Update Password
                </button>
              </div>
            </>
          )}
        </section>

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
                Are you sure you want to delete your account?
                </p>

                <input
                type="password"
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                style={{ marginBottom: "10px", width: "100%" }}
                />

                {deleteError && (
                <p style={{ color: "red", marginBottom: "10px" }}>
                    {deleteError}
                </p>
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
                    style={{
                    background: "#ef4444",
                    color: "white",
                    }}
                    onClick={() => {
                    if (deletePassword !== "test123") {
                        setDeleteError("Incorrect password");
                        return;
                    }

                    alert("Account deleted (mock)");
                    }}
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