import { useRef, useState } from "react";
import { Pen } from "lucide-react";
import testImage from "../icons/test_image.png";
import '../styles/profile.css';

const ProfileSettings = () => {

    const user = { 
        name: "John Doe", 
        email: "john.doe@mail.utoronto.ca", 
        avatarUrl: testImage, 
        
    };

    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        birthday: user.birthday
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const [avatar, setAvatar] = useState(user.avatarUrl);
    const fileInputRef = useRef(null);

    const handleEditClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAvatar(url);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // For now, just logging
        console.log("Form submitted");
    };


    return (
        <div className="settings-page">
            <div className="description">
                <p id="title">Personal Information</p>
                <p id="explanation">Update your profile details</p>
            </div> 
        
            <form onSubmit={handleSubmit}>
                <div className="left-inputs">
                    <label>Full Name</label>
                    <input type="text"  placeholder="Your Name" value={formData?.name} name="name" onChange={handleChange} />

                    <label>Email</label>
                    <input type="email"  placeholder="@mail.utoronto.ca" value={formData?.email} name="email" onChange={handleChange} />

                    <label>Birthday</label>
                    <input type="date" name="birthday" placeholder="MM/DD/YYYY"  value={formData?.birthday} onChange={handleChange}/>

                    <button className="submit-form" type="submit">Save Changes</button>
                </div>

                <div className="profile-avatar-section">
                    <label>Profile picture</label>
                    <img src={avatar} alt="User Avatar" className="profile-avatar"/>
                    <button type="button" className="edit-avatar-button" onClick={handleEditClick}>
                        <Pen size={16}/>
                        Edit
                    </button>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        name="avatar"
                    />
                </div>

                
            </form>
        </div>
    );
};

export default ProfileSettings;
