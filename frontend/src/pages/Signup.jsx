import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, Calendar, Send } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/Signup.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    utorid: '',
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          utorid: formData.utorid.trim(),
          name: formData.name.trim(),
          email: formData.email.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      toast.success(`Account created! Your temporary password is: ${data.resetToken}`);
      toast.info('Please save this password and use it to log in', { duration: 10000 });
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <div className="signup-branding">
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

        <div className="signup-content">
          <h1 className="signup-title">Join Our Loyalty Program</h1>
          <p className="signup-description">
            Create an account to start earning points, attending events, and unlocking exclusive rewards.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon blue">
                <Gift size={24} />
              </div>
              <div className="feature-text">
                <h3>Earn Points</h3>
                <p>Accumulate points with every purchase and activity</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon purple">
                <Calendar size={24} />
              </div>
              <div className="feature-text">
                <h3>Event Access</h3>
                <p>Get invited to exclusive member events</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon green">
                <Send size={24} />
              </div>
              <div className="feature-text">
                <h3>Share & Transfer</h3>
                <p>Transfer points to friends and family</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="signup-right">
        <div className="signup-form-container">
          <div className="signup-form-header">
            <h2>Create Account</h2>
            <p>Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label htmlFor="utorid">UTORid</label>
              <input
                type="text"
                id="utorid"
                name="utorid"
                placeholder="Enter your UTORid"
                value={formData.utorid}
                onChange={handleChange}
                minLength={7}
                maxLength={8}
                required
              />
              <small>Your University of Toronto ID (7-8 characters)</small>
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                minLength={1}
                maxLength={50}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="yourname@mail.utoronto.ca"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <small>Must be a @mail.utoronto.ca email address</small>
            </div>

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="login-prompt">
              Already have an account?{' '}
              <Link to="/login" className="login-link">
                Sign in here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
