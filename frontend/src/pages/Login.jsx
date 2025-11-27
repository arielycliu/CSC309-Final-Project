import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Calendar, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import '../styles/Login.css';

function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.userId.trim(), formData.password);

    if (!result.success) {
      toast.error(result.error || 'Login failed');
    } else {
      toast.success('Welcome back!');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-branding">
          <div className="app-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="url(#gradient)" />
              <path d="M24 10L28 22H20L24 10Z" fill="white" />
              <path d="M24 38L20 26H28L24 38Z" fill="white" />
              <path d="M20 24L24 14L28 24L24 34L20 24Z" fill="white" opacity="0.7" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366F1" />
                  <stop offset="1" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="app-name">APP NAME</h2>
        </div>

        <div className="login-content">
          <h1 className="login-title">Manage Your Points, Unlock Rewards</h1>
          <p className="login-description">
            Join our community platform to earn points, attend events, and redeem amazing rewards.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon blue">
                <Gift size={24} />
              </div>
              <div className="feature-text">
                <h3>Earn & Redeem Points</h3>
                <p>Participate in activities and redeem exciting rewards</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon purple">
                <Calendar size={24} />
              </div>
              <div className="feature-text">
                <h3>Exclusive Events</h3>
                <p>Access member-only events and activities</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon green">
                <Send size={24} />
              </div>
              <div className="feature-text">
                <h3>Transfer Points</h3>
                <p>Share points with friends and community members</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="userId">User ID</label>
              <input
                type="text"
                id="userId"
                name="userId"
                placeholder="Enter your utorid"
                value={formData.userId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <Link to="/password-reset" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="sign-in-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="signup-prompt">
              Don't have an account?{' '}
              <Link to="/signup" className="signup-link">
                Sign up here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
