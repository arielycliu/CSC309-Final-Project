import{NavLink, Outlet, useNavigate } from "react-router-dom"
import '../styles/profile.css';
import{User, UserPen, UserLock} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Profile = ()=>{;
    const {user} = useAuth();

    return (
    <div id="settings_body">
        <div className="profile-header">
            <img 
                src={user.avatarUrl}
                alt="User Avatar" 
                className="profile-avatar"
            />
            <div id="profile-name">
                <h2>{user?.name}</h2>
                <p>your personal account</p>
            </div>

        </div>
        <div className="profile-page">
            <div className="menu">
                <NavLink to="" end className="button">
                    <User className="icon"/> Account status
                </NavLink>
                <NavLink to="edit" className="button">
                    <UserPen className="icon"/> Edit profile
                </NavLink>
                <NavLink to="security" className="button">
                    <UserLock className="icon"/> Password and authentication
                </NavLink>
            </div>

            <div id="subpage">
                <Outlet />
            </div>
        </div>
    </div>
  );
};

export default Profile;