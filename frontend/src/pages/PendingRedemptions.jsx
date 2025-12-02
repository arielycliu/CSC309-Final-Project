import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Gift, Clock, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import '../styles/PendingRedemptions.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const PendingRedemptions = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [allRedemptions, setAllRedemptions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 5;

    useEffect(() => {
        fetchPendingRedemptions();
    }, []);

    const fetchPendingRedemptions = async () => {
        setLoading(true);
        try {
            let allTransactions = [];
            let currentPageNum = 1;
            let hasMore = true;
            const fetchLimit = 10;

            while (hasMore) {
                const params = new URLSearchParams();
                params.append('type', 'redemption');
                params.append('page', currentPageNum.toString());
                params.append('limit', fetchLimit.toString());

                const response = await fetch(`${API_BASE}/users/me/transactions?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch redemption requests');
                }

                const data = await response.json();
                const results = data.results || [];
                
                if (results.length === 0) {
                    hasMore = false;
                } else {
                    allTransactions = allTransactions.concat(results);
                    if (results.length < fetchLimit) {
                        hasMore = false;
                    } else {
                        currentPageNum++;
                    }
                }
            }
            
            const pending = allTransactions.filter(
                transaction => transaction.type === 'redemption' && !transaction.processedBy
            );
            setAllRedemptions(pending);
        } catch (error) {
            toast.error(error.message || 'Failed to load pending redemption requests');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const totalCount = allRedemptions.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const redemptions = allRedemptions.slice(startIndex, endIndex);

    return (
        <div className="pending-redemptions-page">
            <div className="page-header">
                <h2>Pending Redemption Requests</h2>
                <p>View QR codes for your unprocessed redemption requests</p>
            </div>

            {loading ? (
                <div className="loading-state">Loading redemption requests...</div>
            ) : allRedemptions.length === 0 ? (
                <div className="empty-state">
                    <Gift size={48} className="empty-icon" />
                    <h3>No Pending Redemptions</h3>
                    <p>You don't have any unprocessed redemption requests</p>
                </div>
            ) : (
                <>
                    <div className="redemptions-grid">
                        {redemptions.map((redemption) => (
                            <div key={redemption.id} className="redemption-card">
                                <div className="redemption-card-header">
                                    <div className="redemption-status">
                                        <Clock size={18} />
                                        <span>Pending</span>
                                    </div>
                                </div>
                                <div className="redemption-qr-section">
                                    <div className="qr-code-wrapper">
                                        <QRCodeSVG 
                                            value={btoa(redemption.id.toString())} 
                                            size={200}
                                            level="M"
                                        />
                                    </div>
                                    <p className="qr-code-label">Transaction ID: {redemption.id}</p>
                                </div>
                                <div className="redemption-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Points to Redeem: {Math.abs(redemption.amount) || 0}</span>
                                    </div>
                                    {redemption.remark && (
                                        <div className="detail-item">
                                            <span className="detail-label">Remark: {redemption.remark}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="redemption-instruction">
                                    <QrCode size={16} />
                                    <p>Show this QR code to a cashier</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                Previous
                            </button>
                            <span className="page-info">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className="page-btn"
                                disabled={currentPage >= totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PendingRedemptions;

