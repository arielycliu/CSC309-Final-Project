import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { DollarSign, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import '../styles/RedemptionRequest.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const RedemptionRequest = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [createdTransaction, setCreatedTransaction] = useState(null);
    const [formData, setFormData] = useState({
        amount: '',
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
            const pointAmount = parseInt(formData.amount, 10);

            if (pointAmount <= 0) {
                throw new Error('Amount must be greater than 0');
            }

            if (user.points < pointAmount) {
                throw new Error(`You have ${user.points} points, but tried to redeem ${pointAmount} points`);
            }

            const requestBody = {
                type: 'redemption',
                amount: pointAmount,
                remark: formData.remark.trim() || undefined,
            };

            const response = await fetch(`${API_BASE}/users/me/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create redemption request');
            }

            const result = await response.json();
            setCreatedTransaction(result);
            toast.success(`Redemption request created! Transaction ID: ${result.id}`);
            
            setFormData({
                amount: '',
                remark: '',
            });
        } catch (error) {
            toast.error(error.message || 'Failed to create redemption request');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAnother = () => {
        setCreatedTransaction(null);
    };

    return (
        <div className="redemption-request-page">
            <div className="page-header">
                <h2>Create Redemption Request</h2>
            </div>

            {createdTransaction ? (
                <div className="redemption-success">
                    <div className="success-message">
                        <h3>Redemption Request Created!</h3>
                        <p>Transaction ID: <strong>{createdTransaction.id}</strong></p>
                        <p>Amount: <strong>{createdTransaction.amount} points</strong></p>
                        {createdTransaction.remark && (
                            <p>Remark: {createdTransaction.remark}</p>
                        )}
                        <p className="qr-instruction">Show this QR code to a cashier to process your redemption</p>
                    </div>
                    <div className="qr-code-display">
                        <div className="qr-code-wrapper">
                            <QRCodeSVG 
                                value={createdTransaction.id.toString()} 
                                size={256}
                                level="M"
                            />
                        </div>
                    </div>
                    <div className="success-actions">
                        <button
                            onClick={handleCreateAnother}
                            className="create-another-btn"
                        >
                            Create Another Request
                        </button>
                        <button
                            onClick={() => navigate('/transactions/pending-redemptions')}
                            className="view-redemptions-btn"
                        >
                            View All Pending Redemptions
                        </button>
                    </div>
                </div>
            ) : (
                <div className="transaction-form-container">
                    <form onSubmit={handleSubmit} className="transaction-form">
                        <div className="form-group">
                            <label htmlFor="amount">
                                <DollarSign size={18} />
                                Points to Redeem *
                            </label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0"
                                min="1"
                                step="1"
                                required
                            />
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
                                rows="4"
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate('/transactions')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Redemption Request'}
                            </button>
                        </div>
                    </form>

                    <div className="info-panel">
                        <h3>Redemption Info</h3>
                        <div className="info-item">
                            <strong>How it works:</strong>
                            <p>After creating the request, you'll receive a QR code</p>
                            <p>Show the QR code to a cashier to complete the redemption</p>
                        </div>
                        <div className="info-item">
                            <strong>Requirements:</strong>
                            <p>You must be verified</p>
                            <p>You must have sufficient points</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RedemptionRequest;

