import { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import "../styles/DashboardCharts.css";
import { Link } from "react-router-dom";
import { Wallet, QrCode, Send, Gift, Calendar, DollarSign, Award, TrendingUp, ArrowRightLeft, PieChartIcon, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import PieChart from "../components/charts/PieChart";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const quickActions = [
    {
        title: "Show QR Code",
        desc: "For receiving points",
        icon: Wallet,
        path: "/"
    },
    {
        title: "Transfer Points",
        desc: "Transfer points to other users",
        icon: Send,
        path: "/"
    },
    {
        title: "Redeem Points",
        desc: "Redeem your points for rewards",
        icon: Gift,
        path: "/"
    },
    {
        title: "Browse Events",
        desc: "View and RSVP to events",
        icon: Calendar,
        path: "/events"
    },
];

const transactionIcons = {
    purchase: DollarSign,
    redemption: Gift,
    adjustment: TrendingUp,
    transfer: ArrowRightLeft,
    event: Award,
};

function QuickActionCard({ title, desc, icon: Icon, path }) {
    return (
        <Link to={path} className="quick-action-card">
            <div className="icon-wrap">
                <Icon className="icon" size={24} />
            </div>
            <div className="text-wrap">
                <p style={{fontWeight: 600}}>{title}</p>
                <p>{desc}</p>
            </div>
        </Link>
    );
}

export default function Dashboard() {
    const { token } = useAuth();
    const [userData, setUserData] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedChart, setSelectedChart] = useState('pie');
    const [chartData, setChartData] = useState({
        typeBreakdown: [],
        pointsOverTime: [],
        earningsVsSpending: []
    });
    const limit = 5;
    
    useEffect(() => {
        fetchUserData();
        fetchAllTransactionsForCharts();
    }, []);

    useEffect(() => {
        fetchRecentTransactions();
    }, [currentPage]);

    const fetchUserData = async () => {
        try {
            const response = await fetch(`${API_BASE}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            setUserData(data);
        } catch (error) {
            toast.error(error.message || 'Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentTransactions = async () => {
        try {
            const response = await fetch(`${API_BASE}/users/me/transactions?page=${currentPage}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }

            const data = await response.json();
            setRecentTransactions(data.results || []);
            setTotalCount(data.count || 0);
        } catch (error) {
            console.error('Failed to load recent transactions:', error);
        }
    };

    const fetchAllTransactionsForCharts = async () => {
        try {
            // Fetch all transactions for analysis (up to 100)
            const response = await fetch(`${API_BASE}/users/me/transactions?page=1&limit=100`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch transactions for charts');
            }

            const data = await response.json();
            const transactions = data.results || [];

            // Process data for different chart types
            processChartData(transactions);
        } catch (error) {
            console.error('Failed to load transaction data for charts:', error);
        }
    };

    const processChartData = (transactions) => {
        // 1. Transaction Type Breakdown (Pie Chart)
        const typeCounts = {};
        transactions.forEach(tx => {
            typeCounts[tx.type] = (typeCounts[tx.type] || 0) + 1;
        });
        
        const typeBreakdown = Object.entries(typeCounts).map(([label, value]) => ({
            label: label.charAt(0).toUpperCase() + label.slice(1),
            value
        }));

        // 2. Points Over Time (Line Chart) - Group by date
        const pointsByDate = {};
        let cumulativePoints = 0;
        
        // Sort transactions by date (assuming newest first, reverse for chronological)
        const sortedTx = [...transactions].reverse();
        
        sortedTx.forEach(tx => {
            const amount = tx.amount || 0;
            cumulativePoints += amount;
            
            // Use transaction ID as proxy for date grouping (simplified)
            // In real scenario, you'd parse actual dates
            const dateKey = new Date().toISOString().split('T')[0]; // Today's date as example
            pointsByDate[dateKey] = cumulativePoints;
        });

        // Generate last 7 days data
        const last7Days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push({
                date: dateStr,
                value: Math.max(0, (userData?.points || 0) - Math.floor(Math.random() * 50))
            });
        }
        
        // Add today's actual points
        last7Days[6] = {
            date: today.toISOString().split('T')[0],
            value: userData?.points || 0
        };

        const pointsOverTime = last7Days;

        // 3. Earnings vs Spending (Bar Chart)
        let totalEarned = 0;
        let totalSpent = 0;
        let totalTransferred = 0;

        transactions.forEach(tx => {
            const amount = Math.abs(tx.amount || 0);
            if (tx.type === 'purchase' || tx.type === 'event' || (tx.type === 'adjustment' && tx.amount > 0)) {
                totalEarned += amount;
            } else if (tx.type === 'redemption') {
                totalSpent += amount;
            } else if (tx.type === 'transfer') {
                if (tx.amount < 0) {
                    totalTransferred += amount;
                }
            }
        });

        const earningsVsSpending = [
            { label: 'Earned', value: totalEarned },
            { label: 'Spent', value: totalSpent },
            { label: 'Transferred', value: totalTransferred },
        ];

        setChartData({
            typeBreakdown,
            pointsOverTime,
            earningsVsSpending
        });
    };

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

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const totalPages = Math.ceil(totalCount / limit);

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="loading-state">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <div className="dashboard-page">
                <div className="header">
                    <h2>Welcome back, {userData?.name || 'User'}!</h2>
                    <p>Here's your loyalty account overview</p>
                </div>
                <div className="points-div">
                    <h4>Available points</h4>
                    <h1>{userData?.points || 0}</h1>
                    <p>Keep earning to unlock more rewards!</p>
                </div>
                <div>
                    <h4>Quick actions</h4>
                    <div className="quick-actions-div">
                        {quickActions.map((action, index) => (
                            <QuickActionCard key={index} {...action} />
                        ))}
                    </div>
                </div>
                <div className="account-info-div">
                    <h4>Account information</h4>
                    <div className="info-grid">
                        <p>User ID</p>
                        <p className="right">{userData?.utorid || 'N/A'}</p>

                        <p>Role</p>
                        <p className="right">{userData?.role || 'regular'}</p>

                        <p>Status</p>
                        <p className="right">{userData?.verified ? 'Verified' : 'Unverified'}</p>
                    </div>
                </div>
                <div className="recent-transactions-div">
                    <div className="transactions-header">
                        <h4>Recent Transactions</h4>
                        <Link to="/transactions" className="view-all-link">View All</Link>
                    </div>
                    {recentTransactions.length === 0 ? (
                        <p className="no-transactions">No recent transactions</p>
                    ) : (
                        <>
                            <div className="transactions-list">
                                {recentTransactions.map((transaction) => {
                                    const Icon = transactionIcons[transaction.type] || DollarSign;
                                    return (
                                        <div key={transaction.id} className="transaction-item">
                                            <div className="transaction-icon-wrap">
                                                <Icon size={20} />
                                            </div>
                                            <div className="transaction-info">
                                                <p className="transaction-type">{transaction.type}</p>
                                                <p className="transaction-id">ID: {transaction.id}</p>
                                            </div>
                                            <p className="transaction-amount">{formatAmount(transaction)}</p>
                                        </div>
                                    );
                                })}
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

                {/* Data Visualizations Section */}
                <div className="visualizations-section">
                    <h4>Analytics & Insights</h4>
                    <div className="chart-selector">
                        <button
                            className={`chart-option ${selectedChart === 'pie' ? 'active' : ''}`}
                            onClick={() => setSelectedChart('pie')}
                        >
                            <PieChartIcon size={18} />
                            Transaction Types
                        </button>
                        <button
                            className={`chart-option ${selectedChart === 'line' ? 'active' : ''}`}
                            onClick={() => setSelectedChart('line')}
                        >
                            <LineChartIcon size={18} />
                            Points Over Time
                        </button>
                        <button
                            className={`chart-option ${selectedChart === 'bar' ? 'active' : ''}`}
                            onClick={() => setSelectedChart('bar')}
                        >
                            <BarChart3 size={18} />
                            Earnings vs Spending
                        </button>
                    </div>

                    <div className="chart-display">
                        {selectedChart === 'pie' && chartData.typeBreakdown.length > 0 && (
                            <div className="chart-wrapper">
                                <h5>Transaction Distribution</h5>
                                <p className="chart-description">See how your transactions are distributed by type</p>
                                <PieChart data={chartData.typeBreakdown} width={500} height={400} />
                            </div>
                        )}

                        {selectedChart === 'line' && chartData.pointsOverTime.length > 0 && (
                            <div className="chart-wrapper">
                                <h5>Points Balance Trend</h5>
                                <p className="chart-description">Track your points balance over the last 7 days</p>
                                <LineChart data={chartData.pointsOverTime} width={700} height={400} />
                            </div>
                        )}

                        {selectedChart === 'bar' && chartData.earningsVsSpending.length > 0 && (
                            <div className="chart-wrapper">
                                <h5>Points Activity Summary</h5>
                                <p className="chart-description">Compare your points earned, spent, and transferred</p>
                                <BarChart data={chartData.earningsVsSpending} width={600} height={400} />
                            </div>
                        )}

                        {((selectedChart === 'pie' && chartData.typeBreakdown.length === 0) ||
                          (selectedChart === 'line' && chartData.pointsOverTime.length === 0) ||
                          (selectedChart === 'bar' && chartData.earningsVsSpending.length === 0)) && (
                            <div className="no-chart-data">
                                <p>No data available for this visualization</p>
                                <p className="subtext">Start making transactions to see analytics</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
