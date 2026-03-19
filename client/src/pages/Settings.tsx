import { useState } from "react";

const Settings = () => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const handleDelete = () => {
        if (confirmText === "DELETE") {
            alert("Account deleted (mock)");
        }
    };

    return (
        <main className="page">
            <h1>Settings</h1>

            <section className="settings-section">
                <h2>Profile</h2>

                <div className="settings-form">
                    <input type="text" placeholder="Username" />
                    <input type="email" placeholder="Email" />
                    <textarea placeholder="Bio" />
                </div>

                <button>Save Changes</button>
            </section>

            <section className="settings-section">
                <h2>Password</h2>

                <div className="settings-form">
                    <input type="password" placeholder="Current Password" />
                    <input type="password" placeholder="New Password" />
                </div>

                <button>Update Password</button>
            </section>

            <section className="settings-section danger">
                <h2>Delete Account</h2>

                <button
                    className="delete-btn"
                    onClick={() => setShowDeleteConfirm(true)}
                >
                    Delete Account
                </button>
            </section>

            {showDeleteConfirm && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Are you sure?</h3>
                        <p>Type DELETE to confirm</p>

                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                        />

                        <div className="modal-actions">
                            <button onClick={handleDelete}>Confirm</button>
                            <button onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Settings;