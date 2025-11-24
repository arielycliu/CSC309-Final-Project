import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { DollarSign, User, Tag, FileText } from 'lucide-react';
import '../styles/PurchaseTransaction.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const PurchaseTransaction = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    utorid: '',
    spent: '',
    promotionIds: '',
    remark: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse promotion IDs if provided
      let promotionIds = null;
      if (formData.promotionIds.trim()) {
        promotionIds = formData.promotionIds
          .split(',')
          .map(id => parseInt(id.trim(), 10))
          .filter(id => !isNaN(id));
      }

      const requestBody = {
        type: 'purchase',
        utorid: formData.utorid.trim(),
        spent: parseFloat(formData.spent),
        promotionIds,
        remark: formData.remark.trim() || undefined,
      };

      const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create purchase transaction');
      }

      const result = await response.json();
      toast.success(`Transaction created! User earned ${result.earned} points.`);
      
      // Reset form
      setFormData({
        utorid: '',
        spent: '',
        promotionIds: '',
        remark: '',
      });
    } catch (error) {
      toast.error(error.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="purchase-transaction-page">
      <div className="page-header">
        <h2>Create Purchase Transaction</h2>
        <p>Record a customer purchase and award points</p>
      </div>

      <div className="transaction-form-container">
        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-group">
            <label htmlFor="utorid">
              <User size={18} />
              Customer UTORid *
            </label>
            <input
              type="text"
              id="utorid"
              name="utorid"
              value={formData.utorid}
              onChange={handleChange}
              placeholder="Enter customer UTORid"
              required
            />
            <small>The customer who made the purchase</small>
          </div>

          <div className="form-group">
            <label htmlFor="spent">
              <DollarSign size={18} />
              Amount Spent ($) *
            </label>
            <input
              type="number"
              id="spent"
              name="spent"
              value={formData.spent}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
            <small>Purchase amount in dollars (points = spent / 0.25)</small>
          </div>

          <div className="form-group">
            <label htmlFor="promotionIds">
              <Tag size={18} />
              Promotion IDs (Optional)
            </label>
            <input
              type="text"
              id="promotionIds"
              name="promotionIds"
              value={formData.promotionIds}
              onChange={handleChange}
              placeholder="e.g., 1, 2, 3"
            />
            <small>Comma-separated promotion IDs to apply</small>
          </div>

          <div className="form-group">
            <label htmlFor="remark">
              <FileText size={18} />
              Remark (Optional)
            </label>
            <textarea
              id="remark"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              placeholder="Add any additional notes..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Transaction'}
            </button>
          </div>
        </form>

        <div className="info-panel">
          <h3>Transaction Info</h3>
          <div className="info-item">
            <strong>Points Calculation:</strong>
            <p>Base points = Amount spent ÷ $0.25</p>
            <p>Bonus points may be added via promotions</p>
          </div>
          <div className="info-item">
            <strong>Promotions:</strong>
            <p>Enter valid promotion IDs to apply bonus points or rate multipliers</p>
          </div>
          <div className="info-item">
            <strong>Suspicious Transactions:</strong>
            <p>If your account is marked as suspicious, points won't be credited immediately</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTransaction;
