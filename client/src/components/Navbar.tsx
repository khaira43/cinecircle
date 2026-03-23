import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <Link to="/">CineCircle</Link>

            <div className="navbar-right">
                <div className="navbar-links">
                    {isAuthenticated ? (
                        <>
                            <span>Hi, {user?.username}</span>
                            <button onClick={handleLogout}>Log Out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Log In</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>

                <Link to="/settings" className="settings-icon">
                    ⚙️
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;