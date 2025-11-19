import { Wallet, LayoutDashboard, QrCode, Send, Gift, Clock, Calendar, History, User, Settings, LogOut} from "lucide-react";
import './Layout.css';
import{NavLink, Outlet, useNavigate } from "react-router-dom"

const Layout = () => {
    //const { logout } = useContext(AuthContext); //assumming some sort of context that allows logout
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log("call logout function");           
        navigate('/');  // link to profile page 
    };

    //update links to link to different pages 
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
                <Gift className="icon" />Reedeem points 
                </NavLink>
                <NavLink to="/not-working" className="nav-button">
                <Clock className="icon" />Pending Redemptions
                </NavLink>
                <NavLink to="/events" className="nav-button">
                <Calendar className="icon" />Events
                </NavLink>
                <NavLink to="/not-working" className="nav-button">
                <History className="icon" />Transaction History
                </NavLink>
            </nav>

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
                        <Gift className="icon" />Reedeem points 
                        </NavLink>
                            <NavLink to="/not-working" className="nav-button">
                        <Clock className="icon" />Pending Redemptions
                        </NavLink>
                            <NavLink to="/events" className="nav-button">
                        <Calendar className="icon" />Events
                        </NavLink>
                        <NavLink to="/not-working" className="nav-button">
                            <History className="icon" />Transaction History
                        </NavLink>
                        <hr id="line"/>
                    </div>

                    <NavLink to="/not-working" className="dropdown-button">
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
