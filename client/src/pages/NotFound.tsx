import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <main className="page not-found">
            <h1>404</h1>
            <p>This page doesn't exist.</p>
            <Link to="/">
                <button type="button">Back to Home</button>
            </Link>
        </main>
    );
};

export default NotFound;
