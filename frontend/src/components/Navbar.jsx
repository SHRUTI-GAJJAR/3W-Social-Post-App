import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("socially_user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("socially_token");
    localStorage.removeItem("socially_user");
    navigate("/login");
  };

  return (
    <header className="site-header">
      <div className="nav-content">
        <Link className="brand" to="/feed" aria-label="Socially home">
          <span className="brand-mark">S</span>
          Socially
        </Link>
        <nav className="nav-actions" aria-label="Main navigation">
          <Link className="nav-home" to="/feed">Home</Link>
          <span className="nav-user">{user?.username || "Welcome"}</span>
          <button className="text-button" type="button" onClick={handleLogout}>Logout</button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
