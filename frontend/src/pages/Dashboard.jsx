import { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import { Link } from "react-router-dom";
import { Wallet, QrCode, Send, Gift, Calendar, DollarSign, Award, TrendingUp, ArrowRightLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

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
]

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

    useEffect(() => {
        fetchUserData();
        fetchRecentTransactions();
    }, []);

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
            const response = await fetch(`${API_BASE}/users/me/transactions?limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }

            const data = await response.json();
            setRecentTransactions(data.results || []);
        } catch (error) {
            console.error('Failed to load recent transactions:', error);
        }
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

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="loading-state">Loading...</div>
            </div>
        );
    }

    return <>
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
                )}
            </div>
        </div>
    </>
}