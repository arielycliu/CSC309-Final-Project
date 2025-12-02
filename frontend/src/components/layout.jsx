import { Wallet, LayoutDashboard, QrCode, Send, Gift, Clock, Tag, Calendar, History, User, Settings, 
    LogOut, DollarSign, TrendingUp, ArrowLeftRight, ChevronDown, ChevronUp, Gem, ClipboardClock, FolderPen,
    UserPlus, Users} from "lucide-react";
import '../styles/layout.css';
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import RoleSwitcher from "./RoleSwitcher.jsx";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
    const { logout, activeRole, user} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Determine if user has cashier or higher role
    const isRegular = activeRole && activeRole === 'regular'; // put back after testing 
    const isCashier = activeRole && activeRole === 'cashier';
    const isOrganizer = activeRole && activeRole === 'organizer';
    const isCashierOrAbove = activeRole && ['cashier', 'manager', 'superuser'].includes(activeRole);
    const isManagerOrAbove = activeRole && ['manager', 'superuser'].includes(activeRole);

    const PageLinks = () => {
        return <>
            <NavLink to="/" className="nav-button">
                <LayoutDashboard className="icon" />Dashboard
            </NavLink>

            {isRegular && (
                <>
                    <NavLink to="/not-working" className="nav-button">
                        <QrCode className="icon" /> My QR Code 
                    </NavLink>

                    <div className="points nav-button user-dropdown">
                        <NavLink to="/not-working" className="nav-button">
                            <Gem className="icon"/>
                            <p>Points
                                <ChevronDown className=" icon chevron-down" />
                            </p>
                           
                        </NavLink>

                        <div className="dropdown-content">
                            <NavLink to="/not-working" className="nav-button">
                                <Send className="icon" /> Transfer Points
                            </NavLink>
                            <NavLink to="/not-working" className="nav-button">
                                <Gift className="icon" />Redeem Points 
                            </NavLink>
                            <NavLink to="/not-working" className="nav-button">
                                <Clock className="icon" />Pending Redemptions
                            </NavLink>
                        </div>
                    
                    </div>

                    <NavLink to="/transactions" className="nav-button">
                        <History className="icon" />Transaction History
                    </NavLink>
                </>
            )} 
            {isCashierOrAbove && (
                <>
                    <div className="transactions nav-button user-dropdown">
                        <NavLink to="/transactions/process-redemptions" className="nav-button">
                            <ClipboardClock className="icon"/>
                            <p>Process Redemptions</p>
                        </NavLink>
                    </div>
                </>
            )}
            {isCashier && (
                <>
                <NavLink to="/transactions/purchase" className="nav-button">
                        <DollarSign className="icon" />Create Purchase
                </NavLink>
                <NavLink to="/users/create" className="nav-button">
                        <UserPlus className="icon" />Create User
                </NavLink>
                </>
            )}

            {isManagerOrAbove && (
                <> 
                <div className="transactions nav-button user-dropdown">
                    <NavLink to="/transactions" className="nav-button">
                        <ArrowLeftRight className="icon"/>
                        <p>Transactions <ChevronDown className="icon" /></p>
                    </NavLink>
                    <div className="dropdown-content">
                        <NavLink to="/transactions/purchase" className="nav-button">
                            <DollarSign className="icon" />Create Purchase
                        </NavLink>

                        <NavLink to="/transactions/adjustment" className="nav-button">
                            <TrendingUp className="icon" />Create Adjustment
                        </NavLink>

                        <NavLink to="/transactions/transfer" className="nav-button">
                            <Send className="icon" />Transfer Points
                        </NavLink>

                        <NavLink to="/transactions/redemption" className="nav-button">
                            <Gift className="icon" />Redemption Request
                        </NavLink>

                        <NavLink to="/transactions/manage" className="nav-button">
                            <FolderPen className="icon" />Manage Transactions
                        </NavLink>

                    </div>
                    
                    

                </div>
                <NavLink to="/users" className="nav-button">
                        <Users className="icon" />Manage Users
                </NavLink>
                </>
            )}

                {(isManagerOrAbove || isRegular || isOrganizer) && (
                <>  
                    
                    <NavLink to={isManagerOrAbove || isOrganizer ? "/events/manage" : "/events"} className="nav-button">
                        <Calendar className="icon" />{ (isManagerOrAbove || isOrganizer) ? "Manage Events" : "Events"}
                    </NavLink>

                    {!isOrganizer && (
                        <NavLink to="/promotions" className="nav-button">
                            <Tag className="icon" />{isManagerOrAbove ? "Manage Promotions" : "Promotions"}
                        </NavLink>
                    )}
                </>
            )}
        </>
    }

    return <div className="layout-container">
        <header className='top-bar'> 
            <NavLink to="/" id="app-div">
                <Wallet id="app-icon" />App
            </NavLink>

            <nav id='page-links'>
                <PageLinks />
            </nav>

            <div id="user-section">
                <RoleSwitcher/>
                <div className="user-dropdown">
                    <img
                        src={user.avatarUrl}
                        alt="User Avatar"
                        id="user-avatar"
                    />
                    <div className="dropdown-content">
                        <div className="extra-dropdown">
                            <PageLinks />
                            <hr id="line"/>
                        </div>

                        <NavLink to="/settings/profile" className="dropdown-button">
                            <Settings className="icon"/> Profile Settings
                        </NavLink>
                        <button onClick={handleLogout} className="dropdown-button">
                            <LogOut className="icon"/> Logout
                        </button> 
                    </div>
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