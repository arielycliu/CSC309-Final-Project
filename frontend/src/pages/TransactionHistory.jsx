import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Filter, ChevronDown, ChevronUp, TrendingUp, TrendingDown, ArrowRightLeft, Award, Gift, DollarSign } from 'lucide-react';
import '../styles/TransactionHistory.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const transactionIcons = {
  purchase: DollarSign,
  redemption: Gift,
  adjustment: TrendingUp,
  transfer: ArrowRightLeft,
  event: Award,
};

const transactionColors = {
  purchase: '#10b981',
  redemption: '#f59e0b',
  adjustment: '#3b82f6',
  transfer: '#8b5cf6',
  event: '#ec4899',
};

const TransactionHistory = () => {
  const { token } = useAuth();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isNestedRoute = location.pathname !== '/transactions';
  const [filters, setFilters] = useState({
    type: '',
    relatedId: '',
    promotionId: '',
    operator: 'gte',
    amount: '',
    page: 1,
    limit: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [filters.page, filters.limit]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', filters.page);
      params.append('limit', filters.limit);
      
      if (filters.type) params.append('type', filters.type);
      if (filters.relatedId) params.append('relatedId', filters.relatedId);
      if (filters.promotionId) params.append('promotionId', filters.promotionId);
      if (filters.amount && filters.operator) {
        params.append('amount', filters.amount);
        params.append('operator', filters.operator);
      }

      const response = await fetch(`${API_BASE}/users/me/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.results || []);
      setTotalCount(data.count || 0);
    } catch (error) {
      toast.error(error.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchTransactions();
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      relatedId: '',
      promotionId: '',
      operator: 'gte',
      amount: '',
      page: 1,
      limit: 10,
    });
    setTimeout(() => fetchTransactions(), 100);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil(totalCount / filters.limit);

  const formatAmount = (transaction) => {
    const type = transaction.type;
    if (type === 'purchase') return `+${transaction.amount || 0}`;
    if (type === 'redemption') return `-${Math.abs(transaction.amount || 0)}`;
    if (type === 'adjustment') {
      const amt = transaction.amount || 0;
      return amt >= 0 ? `+${amt}` : `${amt}`;
    }
    if (type === 'transfer') {
      const amt = transaction.amount || 0;
      return amt >= 0 ? `+${amt}` : `${amt}`;
    }
    if (type === 'event') return `+${transaction.amount || 0}`;
    return transaction.amount || 0;
  };

  const getTransactionDetails = (transaction) => {
    switch (transaction.type) {
      case 'purchase':
        return `Purchase - Spent: $${transaction.spent || 0}`;
      case 'redemption':
        return `Redemption - Points redeemed`;
      case 'adjustment':
        return `Adjustment - Related ID: ${transaction.relatedId || 'N/A'}`;
      case 'transfer':
        return transaction.amount >= 0 ? 'Transfer received' : 'Transfer sent';
      case 'event':
        return `Event reward - Related ID: ${transaction.relatedId || 'N/A'}`;
      default:
        return transaction.type;
    }
  };

  return (
    <div className="transaction-history-page">
      {!isNestedRoute && (
        <>
          <div className="page-header">
            <h2>Transaction History</h2>
            <p>View all your point transactions</p>
          </div>

      <div className="filter-section">
        <button 
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-grid">
              <div className="filter-field">
                <label htmlFor="type">Transaction Type</label>
                <select
                  id="type"
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="purchase">Purchase</option>
                  <option value="redemption">Redemption</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="transfer">Transfer</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="relatedId">Related ID</label>
                <input
                  type="number"
                  id="relatedId"
                  name="relatedId"
                  value={filters.relatedId}
                  onChange={handleFilterChange}
                  placeholder="Enter related ID"
                />
              </div>

              <div className="filter-field">
                <label htmlFor="promotionId">Promotion ID</label>
                <input
                  type="number"
                  id="promotionId"
                  name="promotionId"
                  value={filters.promotionId}
                  onChange={handleFilterChange}
                  placeholder="Enter promotion ID"
                />
              </div>

              <div className="filter-field">
                <label htmlFor="operator">Amount Operator</label>
                <select
                  id="operator"
                  name="operator"
                  value={filters.operator}
                  onChange={handleFilterChange}
                >
                  <option value="gte">Greater or Equal</option>
                  <option value="lte">Less or Equal</option>
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={filters.amount}
                  onChange={handleFilterChange}
                  placeholder="Enter amount"
                />
              </div>

              <div className="filter-field">
                <label htmlFor="limit">Items per page</label>
                <select
                  id="limit"
                  name="limit"
                  value={filters.limit}
                  onChange={handleFilterChange}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button className="apply-btn" onClick={applyFilters}>
                Apply Filters
              </button>
              <button className="reset-btn" onClick={resetFilters}>
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="transactions-summary">
        <p>Showing {transactions.length} of {totalCount} transactions</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map((transaction) => {
            const Icon = transactionIcons[transaction.type] || DollarSign;
            const color = transactionColors[transaction.type] || '#6b7280';

            return (
              <div key={transaction.id} className="transaction-card">
                <div className="transaction-icon" style={{ backgroundColor: `${color}20`, color }}>
                  <Icon size={24} />
                </div>
                <div className="transaction-details">
                  <h4>{getTransactionDetails(transaction)}</h4>
                  <p className="transaction-meta">
                    ID: {transaction.id}
                    {transaction.remark && ` • ${transaction.remark}`}
                    {transaction.promotionIds && transaction.promotionIds.length > 0 && 
                      ` • Promotions: ${transaction.promotionIds.join(', ')}`}
                  </p>
                </div>
                <div className="transaction-amount" style={{ color }}>
                  {formatAmount(transaction)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={filters.page === 1}
            onClick={() => handlePageChange(filters.page - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {filters.page} of {totalPages}
          </span>
          <button
            className="page-btn"
            disabled={filters.page >= totalPages}
            onClick={() => handlePageChange(filters.page + 1)}
          >
            Next
          </button>
        </div>
      )}
        </>
      )}
      <Outlet />
    </div>
  );
};

export default TransactionHistory;
