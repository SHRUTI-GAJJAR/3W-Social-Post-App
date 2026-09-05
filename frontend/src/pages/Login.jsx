import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const signupMessage = location.state?.message;

  const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", formData);
      localStorage.setItem("socially_token", response.data.token);
      localStorage.setItem("socially_user", JSON.stringify(response.data.user));
      navigate("/feed", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to log in. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand auth-brand"><span className="brand-mark">S</span> Socially</div>
        <p className="auth-kicker">Connect · Share · Enjoy</p>
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Log in to continue sharing</p>
        {signupMessage && <p className="success-message">{signupMessage}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email<input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required /></label>
          <label>Password<input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Your password" required /></label>
          <button className="primary-button" type="submit" disabled={isLoading}>{isLoading ? "Logging in..." : "Login"}</button>
        </form>
        {error && <p className="form-error" role="alert">{error}</p>}
        <p className="auth-switch">Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </section>
    </main>
  );
}

export default Login;
