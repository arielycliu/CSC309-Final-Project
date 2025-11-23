import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import '../styles/PasswordReset.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const initialRequest = { utorid: '' };
const initialReset = { utorid: '', token: '', password: '', confirm: '' };

const PasswordReset = () => {
  const [step, setStep] = useState('request');
  const [requestData, setRequestData] = useState(initialRequest);
  const [resetData, setResetData] = useState(initialReset);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestChange = (event) => {
    const { name, value } = event.target;
    setRequestData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetChange = (event) => {
    const { name, value } = event.target;
    setResetData((prev) => ({ ...prev, [name]: value }));
  };

  const requestToken = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/resets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utorid: requestData.utorid.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Unable to issue reset token');
      }

      const data = await response.json();
      toast.success('Reset token generated. Use it within 1 hour.');
      setResetData((prev) => ({
        ...prev,
        utorid: requestData.utorid.trim(),
        token: data.resetToken,
      }));
      setStep('reset');
    } catch (error) {
      toast.error(error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    if (resetData.password !== resetData.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/resets/${resetData.token.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utorid: resetData.utorid.trim(),
          password: resetData.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Unable to reset password');
      }

      toast.success('Password updated. You can now log in.');
      setStep('request');
      setRequestData(initialRequest);
      setResetData(initialReset);
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-panel">
        <div className="reset-header">
          <h2>Password Reset</h2>
          <p>
            {step === 'request'
              ? 'Enter your UTORid to create a temporary reset token.'
              : 'Enter the reset token and pick a new password.'}
          </p>
        </div>

        {step === 'request' ? (
          <form className="reset-form" onSubmit={requestToken}>
            <label htmlFor="utorid">UTORid</label>
            <input
              id="utorid"
              name="utorid"
              type="text"
              value={requestData.utorid}
              onChange={handleRequestChange}
              placeholder="Enter your UTORid"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset token'}
            </button>
          </form>
        ) : (
          <form className="reset-form" onSubmit={updatePassword}>
            <label htmlFor="reset-utorid">UTORid</label>
            <input
              id="reset-utorid"
              name="utorid"
              type="text"
              value={resetData.utorid}
              onChange={handleResetChange}
              required
            />

            <label htmlFor="token">Reset token</label>
            <input
              id="token"
              name="token"
              type="text"
              value={resetData.token}
              onChange={handleResetChange}
              required
            />

            <label htmlFor="password">New password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={resetData.password}
              onChange={handleResetChange}
              required
              placeholder="Min 8 chars with mixed case, number, symbol"
            />

            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              value={resetData.confirm}
              onChange={handleResetChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Updating…' : 'Update password'}
            </button>

            <button type="button" className="secondary" onClick={() => setStep('request')}>
              Start over
            </button>
          </form>
        )}

        <div className="reset-footer">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
