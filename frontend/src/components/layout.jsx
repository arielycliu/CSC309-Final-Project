import { Wallet, LayoutDashboard, QrCode, Send, Gift, Clock, Tag, Calendar, History, User, Settings, LogOut, DollarSign, TrendingUp} from "lucide-react";
import '../styles/layout.css';
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import RoleSwitcher from "./RoleSwitcher.jsx";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
    const { logout, activeRole } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Determine if user has cashier or higher role
    const isCashierOrAbove = activeRole && ['cashier', 'manager', 'superuser'].includes(activeRole);
    const isManagerOrAbove = activeRole && ['manager', 'superuser'].includes(activeRole);

    return <div className="layout-container">
        <header className='top-bar'>
            
            <NavLink to="/" id="app-div">
                <Wallet id="app-icon" />App
            </NavLink>

            <nav id='page-links'>
                <NavLink to="/" className="nav-button">
                    <LayoutDashboard className="icon" />Dashboard
                </NavLink>
                <NavLink to="/not-working" className="nav-button">
                    <QrCode className="icon" /> My QR Code 
                </NavLink>
                <NavLink to="/not-working" className="nav-button">
                    <Send className="icon" /> Transfer Points
                </NavLink>
                <NavLink to="/not-working" className="nav-button">
                    <Gift className="icon" />Redeem Points 
                </NavLink>
                {isCashierOrAbove && (
                    <NavLink to="/not-working" className="nav-button">
                        <Clock className="icon" />Process Redemptions
                    </NavLink>
                )}
                {isCashierOrAbove && (
                    <NavLink to="/transactions/purchase" className="nav-button">
                        <DollarSign className="icon" />Create Purchase
                    </NavLink>
                )}
                {isManagerOrAbove && (
                    <NavLink to="/transactions/adjustment" className="nav-button">
                        <TrendingUp className="icon" />Create Adjustment
                    </NavLink>
                )}
                <NavLink to="/promotions" className="nav-button">
                    <Tag className="icon" />Promotions
                </NavLink>
                <NavLink to="/events" className="nav-button">
                    <Calendar className="icon" />Events
                </NavLink>
                <NavLink to="/transactions" className="nav-button">
                    <History className="icon" />Transaction History
                </NavLink>
            </nav>

            <RoleSwitcher />
            <div id="user-dropdown">
                <User id="user-icon" />
                <div className="dropdown-content">
                     <div className="extra-dropdown">
                        <NavLink to="/" className="nav-button">
                            <LayoutDashboard className="icon" />Dashboard
                        </NavLink>
                        <NavLink to="/not-working" className="nav-button">
                            <QrCode className="icon" /> My QR Code 
                        </NavLink>
                        <NavLink to="/not-working" className="nav-button">
                            <Send className="icon" /> Transfer Points
                        </NavLink>
                        <NavLink to="/not-working" className="nav-button">
                            <Gift className="icon" />Redeem Points 
                        </NavLink>
                        {isCashierOrAbove && (
                            <NavLink to="/not-working" className="nav-button">
                                <Clock className="icon" />Process Redemptions
                            </NavLink>
                        )}
                        {isCashierOrAbove && (
                            <NavLink to="/transactions/purchase" className="nav-button">
                                <DollarSign className="icon" />Create Purchase
                            </NavLink>
                        )}
                        {isManagerOrAbove && (
                            <NavLink to="/transactions/adjustment" className="nav-button">
                                <TrendingUp className="icon" />Create Adjustment
                            </NavLink>
                        )}
                        <NavLink to="/events" className="nav-button">
                            <Calendar className="icon" />Events
                        </NavLink>
                        <NavLink to="/transactions" className="nav-button">
                            <History className="icon" />Transaction History
                        </NavLink>
                        <hr id="line"/>
                    </div>

                    <NavLink to="settings/profile" className="dropdown-button">
                        <Settings className="icon"/> Profile Settings
                    </NavLink>
                    <button onClick={handleLogout} className="dropdown-button">
                        <LogOut className="icon"/> Logout
                    </button>

                   
                </div>
            </div>
        </header>

        
        <aside id="left-sidebar"></aside>
        <main id="main-content">
            <Outlet />
        </main>
        <aside id="right-sidebar"></aside>
    </div>;
};

export default Layout;
