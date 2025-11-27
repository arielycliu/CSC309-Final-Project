import { use, useRef, useState, useEffect } from "react";
import { Pen } from "lucide-react";
import { z } from "zod";
import '../styles/profile.css';
import { useAuth } from "../context/AuthContext";
import { toast } from 'sonner';


const patchSelfPayload = z.object({
        name: z.string().min(1, "name too short").max(50, "name too long").optional().nullable(),
        email: z.string().email("invalid email format").refine(val => val.endsWith("@mail.utoronto.ca"), {
            message: "must be of domain @mail.utoronto.ca"
        }).optional().nullable(),
        birthday: z.string()
        .optional()
        .nullable()
        .refine((val) => {
        if (!val) return true; // allow null/undefined
            const date = new Date(val);
            if (isNaN(date.getTime())) return false; // invalid date
            const [year, month, day] = val.split("-").map(Number);
            return (
            date.getFullYear() === year &&
            date.getMonth() + 1 === month && 
            date.getDate() + 1 === day
            );
        }, "Birthday must be a valid date in YYYY-MM-DD format")
    
});


const ProfileSettings = () => {
    const {user, token, updateUser} = useAuth();
    const [errors, setErrors] = useState({});
    const [avatar, setAvatar] = useState(user.avatarUrl);
    const fileInputRef = useRef(null);


    const [formData, setFormData] = useState({
        name: user?.name || undefined,
        email: user?.email || undefined,
        birthday: undefined
    });

    const UpdateUserProfile = async () => {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
        const formPayload = new FormData();
            if(formData.name)
            formPayload.append('name', formData.name);
            if(formData.email)
            formPayload.append('email', formData.email);
            if(formData.birthday)
            formPayload.append('birthday', formData.birthday);
            if (fileInputRef.current?.files[0]) {
                formPayload.append('avatar', fileInputRef.current.files[0]);
            }
      try {
            const response = await fetch(`${API_BASE}/users/me`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formPayload
            });

            const userData = await response.json();

            if (!response.ok) {
                setErrors(userData.error || {});
                throw new Error(`${JSON.stringify(userData.error)}`);
            }
            setErrors({});
            console.log("Updated user data:", userData, "user", user);
            updateUser(userData);
            toast.success("Profile updated successfully!");
      } catch (error) {
        console.error(`Error updating profile: ${error.message}`);
        toast.error(`Failed to update profile. Please try again.`);
      }
    };

    const handleChange = (e) => {
        let value = e.target.value;

        // Convert empty string to undefined
        if (value === "") {
            value = undefined;
        }

        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

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

    const handleSubmit = async(e) => {
        e.preventDefault();
        const result = patchSelfPayload.safeParse(formData);

        if (!result.success) {
            // Convert Zod errors into { field: message }
            const fieldErrors = {};
            console.log("FULL ZOD ERROR OBJ:", result.error._zod.def);
            result.error._zod.def.forEach(err => {
                const field = err.path[0];
                fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return; // stop submit
        }

        setErrors({});
        await UpdateUserProfile();
    };

    useEffect(() => {
        if (!user) return;

        setFormData({
            name: user.name ?? undefined,
            email: user.email ?? undefined,
            birthday: user.birthday ?? undefined,
        });

        setAvatar(user.avatarUrl);
    }, [user]);


    return (
        <div className="settings-page">
            <div className="description">
                <p id="title">Personal Information</p>
                <p id="explanation">Update your profile details</p>
            </div> 
        
            <form onSubmit={handleSubmit}>
                <div className="profile-avatar-section">
                    <label>Profile picture</label>
                    <div className="avatar-wrapper">
                        <img src={avatar} alt="User Avatar" className="profile-avatar"/>
                        <button type="button" className="edit-avatar-button" onClick={handleEditClick}>
                            <Pen size={16}/>
                            Edit
                        </button>
                    </div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        name="avatar"
                    />
                </div>

                <div className="right-inputs">
                    <label>Full Name</label>
                    <input type="text"  placeholder="Your Name" value={formData?.name ?? ""} name="name" onChange={handleChange} />
                    <p className={errors.name? "input-error": "input-error message"}>{errors.name || "Maximum 50 chanracters"}</p>

                    <label>Email</label>
                    <input type="email"  placeholder="@mail.utoronto.ca" value={formData?.email ?? ""} name="email" onChange={handleChange} />
                    <p className={errors.email? "input-error": "input-error message"}>{errors.email || "Email must be of domain @mail.utoronto.ca"}</p>

                    <label>Birthday</label>
                    <input type="date" name="birthday" placeholder="MM/DD/YYYY"  value={formData?.birthday ?? ""} onChange={handleChange}/>
                    <p className="input-error">{errors.birthday || "\u00A0"}</p>

                    <button className="submit-form" type="submit">Save Changes</button>
                </div>  
            </form>
        </div>
        
    );
};

export default ProfileSettings;
