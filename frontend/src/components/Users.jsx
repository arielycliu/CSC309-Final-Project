
import "../styles/users.css"
import{NavLink, Outlet, useNavigate } from "react-router-dom"

const User = () => {
    return(
        <div id="user-management-page">
            <div className="user-management-header">
                <div id="title-section">
                    <h2>Manage Users</h2>
                    <p>Search, update, and manage users</p>
                </div>

            </div>

            <div id="subpage">
                <Outlet />
            </div>

        </div>
    )
};

export default User;


