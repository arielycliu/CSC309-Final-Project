import{NavLink, Outlet, useNavigate } from "react-router-dom"
import '../styles/Profile.css';
import{User, UserPen, UserLock} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import UserImage from '../icons/user_image.png';

const Profile = ()=>{;
    const {user} = useAuth();

    return (
    <div id="settings_body">
        <div className="profile-header">
            <img 
                src={user.avatarUrl}
                alt="User Avatar" 
                className="profile-avatar"
                onError={(e) => { e.target.onerror = null; e.target.src = UserImage; }}
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