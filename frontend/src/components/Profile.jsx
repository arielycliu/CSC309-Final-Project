import{NavLink, Outlet, useNavigate } from "react-router-dom"
import testImage from "../icons/test_image.png";
import '../styles/profile.css';
import{User, UserPen, UserLock} from "lucide-react";

const Profile = ()=>{
    //questions to ask: avatar url where is that saved 
    //GET user as context eventually 
    //const navigate = useNavigate();

    const user = { //not sure if all information would actually be in like this may need to be api call instead 
        name: "John Doe",
        avatarUrl: testImage,
        role: "user",
        verified: true, 
        points: 1200
    }

    return (
    <div id="settings_body">
        <div className="profile-header">
            <img 
                src={user?.avatarUrl} 
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