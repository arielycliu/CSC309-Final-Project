import "../styles/Dashboard.css";
import { Link } from "react-router-dom";
import { Wallet, LayoutDashboard, QrCode, Send, Gift, Clock, Calendar, History, User, Settings, LogOut } from "lucide-react";

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
        path: "/"
    },
]

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
    const user = "John"; // placeholder for auth
    const points = 1250; // placeholder
    const userId = "user001";
    const role = "User";
    const status = "Verified";

    return <>
        <div className="dashboard-page">
            <div className="header">
                <h2>Welcome back, {user}!</h2>
                <p>Here's your loyalty account overview</p>
            </div>
            <div className="points-div">
                <h4>Available points</h4>
                <h1>{points}</h1>
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
                    <p className="right">{userId}</p>

                    <p>Role</p>
                    <p className="right">{role}</p>

                    <p>Status</p>
                    <p className="right">{status}</p>
                </div>
            </div>
        </div>
    </>
}