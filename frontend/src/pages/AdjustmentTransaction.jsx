import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, User, Link2, Tag, FileText } from 'lucide-react';
import '../styles/AdjustmentTransaction.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const AdjustmentTransaction = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    utorid: '',
    amount: '',
    relatedId: '',
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
        type: 'adjustment',
        utorid: formData.utorid.trim() || undefined,
        amount: parseInt(formData.amount, 10),
        relatedId: parseInt(formData.relatedId, 10),
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
        throw new Error(error.error || 'Failed to create adjustment transaction');
      }

      const result = await response.json();
      toast.success(`Adjustment created! ${result.amount >= 0 ? 'Added' : 'Removed'} ${Math.abs(result.amount)} points.`);
      
      // Reset form
      setFormData({
        utorid: '',
        amount: '',
        relatedId: '',
        promotionIds: '',
        remark: '',
      });
    } catch (error) {
      toast.error(error.message || 'Failed to create adjustment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adjustment-transaction-page">
      <div className="page-header">
        <h2>Create Adjustment Transaction</h2>
        <p>Adjust points for a specific transaction</p>
      </div>

      <div className="transaction-form-container">
        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-group">
            <label htmlFor="relatedId">
              <Link2 size={18} />
              Related Transaction ID *
            </label>
            <input
              type="number"
              id="relatedId"
              name="relatedId"
              value={formData.relatedId}
              onChange={handleChange}
              placeholder="Enter transaction ID"
              min="1"
              required
            />
            <small>The transaction ID to create an adjustment for</small>
          </div>

          <div className="form-group">
            <label htmlFor="utorid">
              <User size={18} />
              Customer UTORid (Optional)
            </label>
            <input
              type="text"
              id="utorid"
              name="utorid"
              value={formData.utorid}
              onChange={handleChange}
              placeholder="Leave blank to use related transaction's user"
            />
            <small>If not provided, uses the user from the related transaction</small>
          </div>

          <div className="form-group">
            <label htmlFor="amount">
              <TrendingUp size={18} />
              Adjustment Amount *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0 (positive to add, negative to remove)"
              required
            />
            <small>Use positive numbers to add points, negative to remove</small>
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
            <small>Comma-separated promotion IDs to apply additional points</small>
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
              placeholder="Reason for adjustment..."
              rows="3"
            />
            <small>Explain why this adjustment is being made</small>
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
              {loading ? 'Creating...' : 'Create Adjustment'}
            </button>
          </div>
        </form>

        <div className="info-panel">
          <h3>Adjustment Info</h3>
          <div className="info-item">
            <strong>Purpose:</strong>
            <p>Adjustments are used to correct or modify points from existing transactions</p>
          </div>
          <div className="info-item">
            <strong>Amount:</strong>
            <p>Enter a positive number to add points</p>
            <p>Enter a negative number to remove points</p>
          </div>
          <div className="info-item">
            <strong>Related Transaction:</strong>
            <p>Must reference a valid existing transaction ID</p>
            <p>The adjustment will be linked to this transaction</p>
          </div>
          <div className="info-item">
            <strong>User Validation:</strong>
            <p>If you provide a UTORid, it must match the user from the related transaction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentTransaction;
