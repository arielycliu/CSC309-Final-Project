import '../styles/profile.css';
import {Shield} from "lucide-react";

const ProfileStatus = () => {
    const user = { utorid: "johndoe001", role: "User", verified: true, points: 1250}; //check that users come in like this
    return (
        <div className="settings-page">
            <div className="description">
                <p id="title">Account Status</p>
            </div> 
            <div className='account-info'>
                <div className='user-info-div'>
                    <p className='title'>  <Shield size={16}/> Utorid</p>
                    <p className='info utorid'>{user?.utorid}</p>
                </div>
                <div className='user-info-div'>
                    <p className='title'>Role</p>
                    <p className='info role'>{user?.role}</p>
                </div>
                <div className='user-info-div'>
                    <p className='title'>Verifcation Status</p>
                    <p className={user?.verified ? "info verified" : "info unverified"}>
                        {user?.verified ? "Verified" : "Unverified"}
                    </p>
                </div>
                <div className='user-info-div'>
                    <p className='title'>Current Points</p>
                    <p className='info points'>{user?.points.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}


export default ProfileStatus;