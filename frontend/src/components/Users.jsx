
import "../styles/users.css"
import{NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const User = () => {
    const { activeRole } = useAuth();
    const isCashier = activeRole === 'cashier';

    return(
        <div id="user-management-page">
            <div className="user-management-header">
                <div id="title-section">
                    <h2>{isCashier ? "Create New User" : "Manage Users"}</h2>
                    <p>{isCashier ? "Add a new user to the system" : "Search, update, and manage users"}</p>
                </div>

            </div>

            <div id="subpage">
                <Outlet />
            </div>

        </div>
    )
};

export default User;


