import * as Icons from '../icons';
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
            
            <NavLink to="/" id="app-icon">
                <Icons.WalletIcon className="" /> App
            </NavLink>

            <nav id='page-links'>
                <NavLink to="/" className="nav-button">
                <Icons.DashboardIcon className="icon" />Dashboard
                </NavLink>
                <NavLink to="/not-working" className="nav-button">
                <Icons.QRIcon className="icon" /> My QR Code 
                </NavLink>
                <NavLink to="/not-working" className="nav-button">
                <Icons.TransferIcon className="icon" /> Transfer Points
                </NavLink>
                <NavLink to="/not-working" className="nav-button">
                <Icons.RedeemIcon className="icon" />Reedeem points 
                </NavLink>
                <NavLink to="/not-working" className="nav-button">
                <Icons.PendingIcon className="icon" />Pending Redemption
                </NavLink>
                <NavLink to="/not-working" className="nav-button">
                <Icons.EventIcon className="icon" />Events
                </NavLink>
                <NavLink to="/not-working" className="nav-button">
                <Icons.HistoryIcon className="icon" />Transaction History
                </NavLink>
            </nav>

            <div id="user-dropdown">
                <Icons.UserIcon className="icon" />
                <div className="dropdown-content">
                    <NavLink to="/">Profile Settings</NavLink>
                    <button onClick={handleLogout}>Logout</button>
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
