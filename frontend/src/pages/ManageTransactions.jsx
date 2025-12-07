import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import '../styles/ManageTransactions.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const TRANSACTION_TYPES = {
  purchase: { label: 'Purchase', color: '#22c55e' },
  redemption: { label: 'Redemption', color: '#ef4444' },
  transfer: { label: 'Transfer', color: '#3b82f6' },
  adjustment: { label: 'Adjustment', color: '#f59e0b' },
  event: { label: 'Event', color: '#8b5cf6' },
};

export default function ManageTransactions() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  // Filters
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    createdBy: '',
    suspicious: '',
    promotionId: '',
    relatedId: '',
    amount: '',
    operator: 'gte',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [page, token]);

  const fetchTransactions = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add filters if they have values
      if (filters.name) params.append('name', filters.name);
      if (filters.type) params.append('type', filters.type);
      if (filters.createdBy) params.append('createdBy', filters.createdBy);
      if (filters.suspicious) params.append('suspicious', filters.suspicious);
      if (filters.promotionId) params.append('promotionId', filters.promotionId);
      if (filters.relatedId) {
        params.append('relatedId', filters.relatedId);
        if (!filters.type) {
          toast.error('Please select a transaction type when filtering by Related ID');
          setLoading(false);
          return;
        }
      }
      if (filters.amount) {
        params.append('amount', filters.amount);
        params.append('operator', filters.operator);
      }

      const response = await fetch(`${API_BASE}/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.results || []);
      setCount(data.count || 0);
    } catch (error) {
      toast.error(error.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    fetchTransactions();
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      type: '',
      createdBy: '',
      suspicious: '',
      promotionId: '',
      relatedId: '',
      amount: '',
      operator: 'gte',
    });
    setPage(1);
    setTimeout(fetchTransactions, 100);
  };

  const handleViewDetails = async (transaction) => {
    try {
      const response = await fetch(`${API_BASE}/transactions/${transaction.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch transaction details');
      }

      const data = await response.json();
      setSelectedTransaction(data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error(error.message || 'Failed to load transaction details');
    }
  };

  const handleToggleSuspicious = async (transactionId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE}/transactions/${transactionId}/suspicious`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suspicious: !currentStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update transaction');
      }

      toast.success(`Transaction marked as ${!currentStatus ? 'suspicious' : 'normal'}`);
      fetchTransactions();
      
      if (selectedTransaction && selectedTransaction.id === transactionId) {
        setSelectedTransaction(prev => ({ ...prev, suspicious: !currentStatus }));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update transaction');
    }
  };

  const totalPages = Math.ceil(count / limit);

  const formatAmount = (transaction) => {
    if (transaction.earned !== undefined) return `+${transaction.earned}`;
    if (transaction.redeemed !== undefined) return `-${transaction.redeemed}`;
    if (transaction.sent !== undefined) return `-${transaction.sent}`;
    if (transaction.received !== undefined) return `+${transaction.received}`;
    if (transaction.awarded !== undefined) return `+${transaction.awarded}`;
    if (transaction.amount !== null && transaction.amount !== undefined) {
      return transaction.amount >= 0 ? `+${transaction.amount}` : `${transaction.amount}`;
    }
    return '0';
  };

  return (
    <div className="manage-transactions-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Manage Transactions</h1>
          <p>View and manage all system transactions</p>
        </div>
        <button 
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>User Name/UTORid</label>
              <input
                type="text"
                placeholder="Search by name or utorid..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Transaction Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                {Object.entries(TRANSACTION_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Created By</label>
              <input
                type="text"
                placeholder="Creator name or utorid..."
                value={filters.createdBy}
                onChange={(e) => handleFilterChange('createdBy', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Suspicious Status</label>
              <select
                value={filters.suspicious}
                onChange={(e) => handleFilterChange('suspicious', e.target.value)}
              >
                <option value="">All</option>
                <option value="true">Suspicious Only</option>
                <option value="false">Normal Only</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Promotion ID</label>
              <input
                type="number"
                placeholder="Promotion ID..."
                value={filters.promotionId}
                onChange={(e) => handleFilterChange('promotionId', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Related ID</label>
              <input
                type="number"
                placeholder="Related ID..."
                value={filters.relatedId}
                onChange={(e) => handleFilterChange('relatedId', e.target.value)}
              />
              <small>Requires transaction type to be selected</small>
            </div>

            <div className="filter-group">
              <label>Amount</label>
              <div className="amount-filter">
                <select
                  value={filters.operator}
                  onChange={(e) => handleFilterChange('operator', e.target.value)}
                  className="operator-select"
                >
                  <option value="gte">≥</option>
                  <option value="lte">≤</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount..."
                  value={filters.amount}
                  onChange={(e) => handleFilterChange('amount', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button className="apply-btn" onClick={applyFilters}>
              <Search size={16} />
              Apply Filters
            </button>
            <button className="clear-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>
        </div>
      )}

      <div className="transactions-table-container">
        {loading ? (
          <div className="loading-state">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found</p>
          </div>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Spent</th>
                <th>Promotions</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>#{transaction.id}</td>
                  <td>{transaction.utorid || 'N/A'}</td>
                  <td>
                    <span 
                      className="type-badge" 
                      style={{ 
                        backgroundColor: `${TRANSACTION_TYPES[transaction.type]?.color}20`,
                        color: TRANSACTION_TYPES[transaction.type]?.color 
                      }}
                    >
                      {TRANSACTION_TYPES[transaction.type]?.label || transaction.type}
                    </span>
                  </td>
                  <td className={`amount ${formatAmount(transaction).startsWith('-') ? 'negative' : 'positive'}`}>
                    {formatAmount(transaction)}
                  </td>
                  <td>{transaction.spent ? `$${transaction.spent.toFixed(2)}` : '-'}</td>
                  <td>
                    {transaction.promotionIds && transaction.promotionIds.length > 0
                      ? transaction.promotionIds.join(', ')
                      : '-'}
                  </td>
                  <td>{transaction.createdBy || 'System'}</td>
                  <td>
                    {transaction.suspicious ? (
                      <span className="status-badge suspicious">
                        <AlertTriangle size={14} />
                        Suspicious
                      </span>
                    ) : (
                      <span className="status-badge normal">
                        <CheckCircle size={14} />
                        Normal
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleViewDetails(transaction)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={`action-btn toggle-btn ${transaction.suspicious ? 'mark-normal' : 'mark-suspicious'}`}
                        onClick={() => handleToggleSuspicious(transaction.id, transaction.suspicious)}
                        title={transaction.suspicious ? 'Mark as Normal' : 'Mark as Suspicious'}
                      >
                        {transaction.suspicious ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          
          <span className="pagination-info">
            Page {page} of {totalPages} ({count} total)
          </span>
          
          <button
            className="pagination-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Transaction ID</label>
                  <span>#{selectedTransaction.id}</span>
                </div>
                
                <div className="detail-item">
                  <label>User</label>
                  <span>{selectedTransaction.utorid || 'N/A'}</span>
                </div>
                
                <div className="detail-item">
                  <label>Type</label>
                  <span 
                    className="type-badge" 
                    style={{ 
                      backgroundColor: `${TRANSACTION_TYPES[selectedTransaction.type]?.color}20`,
                      color: TRANSACTION_TYPES[selectedTransaction.type]?.color 
                    }}
                  >
                    {TRANSACTION_TYPES[selectedTransaction.type]?.label || selectedTransaction.type}
                  </span>
                </div>
                
                <div className="detail-item">
                  <label>Amount</label>
                  <span className={formatAmount(selectedTransaction).startsWith('-') ? 'negative' : 'positive'}>
                    {formatAmount(selectedTransaction)} points
                  </span>
                </div>
                
                {selectedTransaction.spent && (
                  <div className="detail-item">
                    <label>Spent</label>
                    <span>${selectedTransaction.spent.toFixed(2)}</span>
                  </div>
                )}
                
                {selectedTransaction.promotionIds && selectedTransaction.promotionIds.length > 0 && (
                  <div className="detail-item">
                    <label>Promotions</label>
                    <span>{selectedTransaction.promotionIds.join(', ')}</span>
                  </div>
                )}
                
                {selectedTransaction.relatedId && (
                  <div className="detail-item">
                    <label>Related ID</label>
                    <span>#{selectedTransaction.relatedId}</span>
                  </div>
                )}
                
                <div className="detail-item">
                  <label>Created By</label>
                  <span>{selectedTransaction.createdBy || 'System'}</span>
                </div>
                
                {selectedTransaction.processedBy && (
                  <div className="detail-item">
                    <label>Processed By</label>
                    <span>{selectedTransaction.processedBy}</span>
                  </div>
                )}
                
                <div className="detail-item">
                  <label>Status</label>
                  {selectedTransaction.suspicious ? (
                    <span className="status-badge suspicious">
                      <AlertTriangle size={14} />
                      Suspicious
                    </span>
                  ) : (
                    <span className="status-badge normal">
                      <CheckCircle size={14} />
                      Normal
                    </span>
                  )}
                </div>
                
                {selectedTransaction.remark && (
                  <div className="detail-item full-width">
                    <label>Remark</label>
                    <span>{selectedTransaction.remark}</span>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button
                  className={`toggle-suspicious-btn ${selectedTransaction.suspicious ? 'mark-normal' : 'mark-suspicious'}`}
                  onClick={() => handleToggleSuspicious(selectedTransaction.id, selectedTransaction.suspicious)}
                >
                  {selectedTransaction.suspicious ? (
                    <>
                      <CheckCircle size={16} />
                      Mark as Normal
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} />
                      Mark as Suspicious
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
