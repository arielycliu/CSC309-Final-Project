
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {use, useState, useEffect } from "react";
import { set, z } from "zod";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft } from 'lucide-react';
import "../styles/users.css"
import UserImage from '../icons/user_image.png';
import { patchUser , getUserAvatarUrl} from "../lib/Users";
import { toast } from 'sonner';

const patchUserSchema = z.object({
    email: z.string().email("invalid email format").refine(val => val.endsWith("@mail.utoronto.ca"), {
        message: "Email must be of domain @mail.utoronto.ca"
    }).optional().nullable(),
    verified: z.literal(true).optional().nullable(),
    suspicious: z.boolean().optional().nullable(),
    role: z.enum(['regular', 'cashier', 'manager', 'superuser']).optional().nullable(),
});

const EditUser = () => {
    const [loading, setLoading] = useState(false);
    const {activeRole} = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const userFromState = location.state?.user;

    useEffect(() => {
        if (!userFromState) {
            navigate('/');
        }
    }, [userFromState, navigate]);

    if (!userFromState) {
        return null;
    }

    const [formData, setFormData] = useState({
        email: userFromState?.email || "",
        verified: userFromState?.verified || undefined,
        suspicious: userFromState?.suspicious || false,
        role: userFromState?.role || "",
    });
    const isSuperuser = activeRole && activeRole === 'superuser'; 
    
    const updateUser = async () => {
        setLoading(true);
        try {
            const updatedUser = await patchUser({ userId: userFromState.id, ...formData });
            setLoading(false);
            toast.success(`User ${updatedUser.name} updated successfully.`);
            setErrors({});
            navigate(-1);
        } catch (error) {
            setLoading(false);
            setErrors(error.error || {});
            console.error("Failed to update user:", JSON.stringify(error));
            toast.error("Failed to update user.");
        }
    };
    const handleSubmit = async(e) => {
        e.preventDefault();

        const result = patchUserSchema.safeParse(formData);

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
        await updateUser();
        //console.log("VALID form:", result.data);
    };
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let finalValue = value;
        
        // Handle checkbox
        if (type === 'checkbox') {
            if(checked === false && name === "verified"){
                finalValue = undefined;
            }else{
                finalValue = checked;
            }
        }
        // Convert empty string to undefined
        else if (value === "") {
            finalValue = undefined;
        }

        setFormData({
            ...formData,
            [name]: finalValue
        });
    };

    return (
        <div className='user-form-page'>
            <div className="description">
                <p id="title">Edit User</p>
            </div>

            <div className="user-profile">
                <img className="profile-image" 
                    src={userFromState?.avatarUrl ? getUserAvatarUrl(userFromState.avatarUrl) : UserImage}
                />
                <div className="user-info">
                    <div>
                        <div className="user-name-status">
                            <p className="name">{userFromState?.name}</p>
                            <p className={userFromState?.verified ? "verified" : "unverified"}>
                                {userFromState?.verified ? "Verified" : "Unverified"}
                            </p>
                        </div>
                        <div className="user-details">
                            <p id="utorid"><strong>UtorId:</strong> {userFromState?.utorid}</p> 
                        </div>
                    </div>
                    <div className="suspicious-toggle">
                        <label className="switch">
                            <input
                                type="checkbox"
                                name="suspicious"
                                checked={formData.suspicious}
                                onChange={handleChange}
                            />
                            <span className="slider"></span>
                        </label>
                        <span>{formData.suspicious ? 'Suspicious' : 'Not Suspicious'}</span>
                    </div>
                </div>
            </div>

            <form className="user-form" onSubmit={handleSubmit}>
                <label className='required'>Email</label>
                <input type="email" placeholder={userFromState?.email} name="email" onChange={handleChange} value={formData.email || ""} required></input>
                <p className={errors.email? "input-error": "input-error message"}>{errors.email || "Email must be of domain @mail.utoronto.ca"}</p>

                <label>Role</label>
                <select className="select-dropdown"name="role" onChange={handleChange} value={formData.role || ""}>
                    <option value="" disabled>Select role</option>
                    <option value="regular">Regular</option>
                    <option value="cashier">Cashier</option>
                    {isSuperuser && <option value="manager">Manager</option>}
                    {isSuperuser && <option value="superuser">Superuser</option>}
                </select>
                <p className={errors.role? "input-error": "input-error message"}>{errors.role || "Cannot promote a suspicious user"}</p>

                {!userFromState?.verified && (
                    <div className='verify-checkbox'>
                        <input 
                            type="checkbox" 
                            name="verified" 
                            onChange={handleChange} 
                            checked={formData.verified || false}
                        />
                        <label>Verify user</label>
                    </div>
                )}
                <div className="user-form-buttons">
                <button className="cancel-btn" type="button" onClick={() => navigate(-1)} disabled={loading}>
                    Cancel
                </button>
                <button className="submit-user-form-btn" type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
                </div>
            </form>
        </div>
    );
}

export default EditUser;
