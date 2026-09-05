import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/signup", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setMessage(response.data.message || "Account created successfully");
      setTimeout(() => navigate("/login", { state: { message: response.data.message || "Account created successfully" } }), 700);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Something went wrong. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand auth-brand"><span className="brand-mark">S</span> Socially</div>
        <p className="auth-kicker">Connect · Share · Enjoy</p>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Make space for the moments that matter.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Username<input type="text" name="username" placeholder="Choose a username" value={formData.username} onChange={handleChange} required /></label>
          <label>Email<input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required /></label>
          <label>Password<input type="password" name="password" placeholder="At least 6 characters" minLength="6" value={formData.password} onChange={handleChange} required /></label>
          <label>Confirm password<input type="password" name="confirmPassword" placeholder="Repeat your password" value={formData.confirmPassword} onChange={handleChange} required /></label>
          <button className="primary-button" type="submit" disabled={isLoading}>{isLoading ? "Creating account..." : "Create Account"}</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </section>
    </main>
  );
}

export default Signup;